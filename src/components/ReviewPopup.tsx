import { useRef, useState, useEffect, useCallback } from "react";
import type { Review, NodeType } from "./Board";
import AudioRecorder from "./AudioRecorder";
import PixelCanvas from "./PixelCanvas";

const MIN_CHARS = 5;
const MAX_CHARS = 150;
const MAX_PHOTO_KB = 100;

interface ReviewPopupProps {
  songName: string;
  nodeType: NodeType;
  onSubmit: (review: Review) => void;
  onClose: () => void;
}

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  text: "Leave a review",
  audio: "Record a voice note",
  drawing: "Draw pixel art",
  photo: "Upload a photo",
};

export default function ReviewPopup({
  songName,
  nodeType,
  onSubmit,
  onClose,
}: ReviewPopupProps) {
  const [name, setName] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  // Text state
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Audio state
  const [audioData, setAudioData] = useState<{
    url: string;
    durationMs: number;
  } | null>(null);

  // Drawing state
  const [drawingDataUrl, setDrawingDataUrl] = useState<string>("");

  // Photo state
  const [photoDataUrl, setPhotoDataUrl] = useState<string>("");
  const [cameraActive, setCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const charCount = text.length;
  const isTextValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
  const isOverLimit = charCount > MAX_CHARS;

  const isValid =
    nodeType === "text"
      ? isTextValid
      : nodeType === "audio"
        ? !!audioData
        : nodeType === "drawing"
          ? !!drawingDataUrl
          : nodeType === "photo"
            ? !!photoDataUrl
            : false;

  // Focus textarea when switching to text
  useEffect(() => {
    if (nodeType === "text") {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [nodeType]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Outside click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose],
  );

  // Compress an image source to a data URL
  const compressImage = useCallback(
    (source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, srcW: number, srcH: number) => {
      const maxDim = 300;
      let w = srcW;
      let h = srcH;
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(source, 0, 0, w, h);

      let quality = 0.7;
      let dataUrl = canvas.toDataURL("image/jpeg", quality);
      while (dataUrl.length > MAX_PHOTO_KB * 1024 * 1.37 && quality > 0.2) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }
      return dataUrl;
    },
    [],
  );

  // Photo upload handling
  const handlePhotoSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        setPhotoDataUrl(compressImage(img, img.width, img.height));
      };
      img.src = objectUrl;
    },
    [compressImage],
  );

  // Camera functions
  const stopCamera = useCallback(() => {
    cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
    cameraStreamRef.current = null;
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      cameraStreamRef.current = stream;
      setCameraActive(true);
      // Wait for video element to mount then attach stream
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch {
      // Fallback: no camera permission or not available
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setPhotoDataUrl(compressImage(video, video.videoWidth, video.videoHeight));
    stopCamera();
  }, [compressImage, stopCamera]);

  // Cleanup camera on unmount or close
  useEffect(() => {
    return () => {
      cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValid) return;

      const authorName = name.trim() || "Anonymous";

      switch (nodeType) {
        case "text":
          onSubmit({ type: "text", name: authorName, text: text.trim() });
          break;
        case "audio":
          if (audioData) {
            onSubmit({
              type: "audio",
              name: authorName,
              audioUrl: audioData.url,
              durationMs: audioData.durationMs,
            });
          }
          break;
        case "drawing":
          onSubmit({
            type: "drawing",
            name: authorName,
            imageDataUrl: drawingDataUrl,
          });
          break;
        case "photo":
          onSubmit({
            type: "photo",
            name: authorName,
            imageDataUrl: photoDataUrl,
          });
          break;
      }
    },
    [name, text, nodeType, isValid, audioData, drawingDataUrl, photoDataUrl, onSubmit],
  );

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 1000, pointerEvents: "all" }}
      onMouseDown={handleBackdropClick}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        ref={cardRef}
        className="review-popup-enter"
        style={{
          width: 380,
          maxHeight: "90vh",
          overflowY: "auto",
          background:
            "linear-gradient(160deg, #0c1a12 0%, #0a1510 50%, #0d1c14 100%)",
          border: "1px solid rgba(34, 197, 94, 0.25)",
          borderRadius: 12,
          padding: 24,
          boxShadow: `
            0 0 40px rgba(0,0,0,0.6),
            0 0 20px rgba(34,197,94,0.08),
            inset 0 1px 0 rgba(255,255,255,0.04)
          `,
          pointerEvents: "all",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              color: "rgba(34,197,94,0.5)",
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 4,
            }}
          >
            {NODE_TYPE_LABELS[nodeType]}
          </div>
          <div
            style={{
              fontSize: 18,
              fontFamily: "monospace",
              color: "#f5c542",
              fontWeight: 700,
            }}
          >
            {songName}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name input (shared across all types) */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontFamily: "monospace",
                color: "rgba(255,255,255,0.35)",
                marginBottom: 5,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Anonymous"
              maxLength={30}
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: 14,
                fontFamily: "monospace",
                color: "#e0e0e0",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(34,197,94,0.15)",
                borderRadius: 6,
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(34,197,94,0.4)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(34,197,94,0.15)")
              }
            />
          </div>

          {/* === TEXT FORM === */}
          {nodeType === "text" && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 5,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Review
              </label>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS + 10))}
                placeholder="What do you think about this song?"
                rows={3}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: 14,
                  fontFamily: "monospace",
                  color: "#e0e0e0",
                  background: "rgba(0,0,0,0.3)",
                  border: `1px solid ${isOverLimit ? "rgba(255,59,92,0.5)" : "rgba(34,197,94,0.15)"}`,
                  borderRadius: 6,
                  outline: "none",
                  resize: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                  lineHeight: 1.5,
                }}
                onFocus={(e) => {
                  if (!isOverLimit)
                    e.target.style.borderColor = "rgba(34,197,94,0.4)";
                }}
                onBlur={(e) => {
                  if (!isOverLimit)
                    e.target.style.borderColor = "rgba(34,197,94,0.15)";
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 5,
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              >
                <span
                  style={{
                    color:
                      charCount < MIN_CHARS
                        ? "rgba(255,255,255,0.25)"
                        : "rgba(34,197,94,0.5)",
                  }}
                >
                  {charCount < MIN_CHARS
                    ? `${MIN_CHARS - charCount} more chars needed`
                    : "Ready"}
                </span>
                <span
                  style={{
                    color: isOverLimit
                      ? "#ff3b5c"
                      : charCount > MAX_CHARS - 20
                        ? "#f5c542"
                        : "rgba(255,255,255,0.2)",
                  }}
                >
                  {charCount}/{MAX_CHARS}
                </span>
              </div>
            </div>
          )}

          {/* === AUDIO FORM === */}
          {nodeType === "audio" && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Voice message
              </label>
              <AudioRecorder
                onDataChange={(url, durationMs) =>
                  setAudioData({ url, durationMs })
                }
              />
            </div>
          )}

          {/* === DRAWING FORM === */}
          {nodeType === "drawing" && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Pixel art
              </label>
              <PixelCanvas onDataChange={setDrawingDataUrl} />
            </div>
          )}

          {/* === PHOTO FORM === */}
          {nodeType === "photo" && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Photo
              </label>

              {cameraActive ? (
                /* Live camera view */
                <div style={{ textAlign: "center" }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      border: "1px solid rgba(34,197,94,0.2)",
                      marginBottom: 8,
                      background: "#000",
                    }}
                  />
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      style={{
                        padding: "8px 20px",
                        fontSize: 11,
                        fontFamily: "monospace",
                        fontWeight: 700,
                        color: "#0a1510",
                        background: "linear-gradient(135deg, #f5c542 0%, #d4a030 100%)",
                        border: "1px solid rgba(245,197,66,0.6)",
                        borderRadius: 6,
                        cursor: "pointer",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Capture
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      style={{
                        padding: "8px 14px",
                        fontSize: 11,
                        fontFamily: "monospace",
                        color: "rgba(255,255,255,0.4)",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 6,
                        cursor: "pointer",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : !photoDataUrl ? (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                  }}
                >
                  {/* Take photo button — opens webcam */}
                  <button
                    type="button"
                    onClick={startCamera}
                    style={{
                      flex: 1,
                      padding: "20px 0",
                      fontSize: 11,
                      fontFamily: "monospace",
                      color: "rgba(255,255,255,0.4)",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px dashed rgba(34,197,94,0.25)",
                      borderRadius: 8,
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      transition: "all 0.2s",
                    }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      style={{ margin: "0 auto 6px" }}
                    >
                      <rect x="3" y="5" width="18" height="15" rx="2" />
                      <circle cx="12" cy="13" r="4" />
                      <path d="M8 5l1-2h6l1 2" />
                    </svg>
                    Take photo
                  </button>
                  {/* Upload button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      flex: 1,
                      padding: "20px 0",
                      fontSize: 11,
                      fontFamily: "monospace",
                      color: "rgba(255,255,255,0.4)",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px dashed rgba(34,197,94,0.25)",
                      borderRadius: 8,
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      transition: "all 0.2s",
                    }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      style={{ margin: "0 auto 6px" }}
                    >
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    style={{ display: "none" }}
                  />
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <img
                    src={photoDataUrl}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 200,
                      borderRadius: 8,
                      border: "1px solid rgba(34,197,94,0.2)",
                      marginBottom: 8,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoDataUrl("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    style={{
                      padding: "4px 12px",
                      fontSize: 10,
                      fontFamily: "monospace",
                      color: "rgba(255,255,255,0.4)",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 4,
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={!isValid}
            style={{
              width: "100%",
              padding: "10px 0",
              fontSize: 13,
              fontFamily: "monospace",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: isValid ? "#0a1510" : "rgba(255,255,255,0.15)",
              background: isValid
                ? "linear-gradient(135deg, #f5c542 0%, #d4a030 100%)"
                : "rgba(255,255,255,0.05)",
              border: isValid
                ? "1px solid rgba(245,197,66,0.6)"
                : "1px solid rgba(255,255,255,0.06)",
              borderRadius: 6,
              cursor: isValid ? "pointer" : "default",
              transition: "all 0.3s ease",
              boxShadow: isValid
                ? "0 0 15px rgba(245,197,66,0.2), 0 0 30px rgba(245,197,66,0.05)"
                : "none",
            }}
          >
            Connect Node
          </button>
        </form>
      </div>
    </div>
  );
}
