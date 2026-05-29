import { useEffect, useRef, useState } from "react";
import type { SongGallery } from "../../../constants/gallery";
import { useIsMobile } from "../hooks/useIsMobile";
import { isYoutubeUrl, getYoutubeThumbnail } from "../helpers";
import NoData from "./NoData";

function VideoThumbnailElement({ src, title, style }: { src: string; title: string; style: React.CSSProperties }) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    const video = document.createElement("video");
    video.src = src;
    video.muted = true;
    (video as HTMLVideoElement & { playsInline: boolean }).playsInline = true;
    video.crossOrigin = "anonymous";
    video.preload = "metadata";

    const capture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 180;
      const ctx = canvas.getContext("2d");
      if (ctx && video.videoWidth > 0) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          setThumbUrl(canvas.toDataURL("image/jpeg", 0.7));
        } catch {
          // CORS block — fall back to <video> element
        }
      }
      video.src = "";
    };

    video.addEventListener("seeked", capture, { once: true });
    video.addEventListener("loadedmetadata", () => {
      video.currentTime = 0.5;
    }, { once: true });

    // On iOS, loadedmetadata may not fire without a play call
    video.addEventListener("canplay", () => {
      if (video.readyState >= 2 && video.currentTime === 0) {
        video.currentTime = 0.5;
      }
    }, { once: true });

    video.load();

    const playAttempt = video.play();
    if (playAttempt) {
      playAttempt.then(() => {
        video.pause();
        if (video.currentTime === 0) video.currentTime = 0.5;
      }).catch(() => {
        // autoplay blocked, loadedmetadata path is the fallback
      });
    }

    return () => {
      video.src = "";
    };
  }, [src]);

  if (thumbUrl) {
    return <img src={thumbUrl} alt={title} style={style} />;
  }

  // Fallback: show <video> with playsInline for desktop
  return (
    <video
      src={src}
      muted
      playsInline
      preload="metadata"
      onLoadedMetadata={(e) => { e.currentTarget.currentTime = 0.5; }}
      style={{ ...style, pointerEvents: "none" }}
    />
  );
}

export default function VideoTab({
  gallery,
  onLightbox,
}: {
  gallery: SongGallery;
  onLightbox: (index: number) => void;
}) {
  const isMobile = useIsMobile();

  if (gallery.videos.length === 0) {
    return <NoData label="NO_SIGNAL" />;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${isMobile ? 1 : 4}, 1fr)`,
        gap: 8,
      }}
    >
      {gallery.videos.map((video, i) => {
        const thumb = video.thumbnail ?? getYoutubeThumbnail(video.src);
        const isDirectVideo = !isYoutubeUrl(video.src) && !thumb;
        return (
          <div
            key={i}
            onClick={() => onLightbox(i)}
            style={{
              aspectRatio: "16/9",
              overflow: "hidden",
              cursor: "pointer",
              border: "1px solid rgba(249,206,15,0.1)",
              transition: "border-color 0.15s, transform 0.15s",
              position: "relative",
              background: "#0a0a0a",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(249,206,15,0.45)";
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(249,206,15,0.1)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {thumb ? (
              <img
                src={thumb}
                alt={video.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : isDirectVideo ? (
              <VideoThumbnailElement
                src={video.src}
                title={video.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "monospace",
                  fontSize: 9,
                  color: "rgba(249,206,15,0.15)",
                  letterSpacing: 2,
                }}
              >
                NO_PREVIEW
              </div>
            )}

            {/* Play icon overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.3)",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(249,206,15,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="12" height="14" viewBox="0 0 10 12" fill="#f9ce0f" style={{ marginLeft: 2 }}>
                  <path d="M1 1L9 6L1 11V1Z" />
                </svg>
              </div>
            </div>

            {/* Title + date overlay */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "16px 8px 6px",
                background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
                fontFamily: "monospace",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <div style={{ fontSize: 11, color: "#f9ce0f", lineHeight: 1.3 }}>
                {video.title}
              </div>
              <div style={{ fontSize: 9, color: "rgba(249,206,15,0.35)" }}>
                {video.date}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
