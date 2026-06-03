import { useState, useEffect } from "react";
import type { SongLabel } from "../../constants/songs";
import { SONG_GALLERY } from "../../constants/gallery";
import AudioTab from "./components/AudioTab";
import PhotoTab from "./components/PhotoTab";
import VideoTab from "./components/VideoTab";
import PhotoLightbox from "./components/PhotoLightbox";
import VideoLightbox from "./components/VideoLightbox";

type Tab = "AUDIO" | "PHOTO_LOG" | "VIDEO_FEED";

interface Props {
  songLabel: SongLabel;
  onClose: () => void;
}

export default function ChipGallery({ songLabel, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("AUDIO");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [videoLightboxIndex, setVideoLightboxIndex] = useState<number | null>(null);
  const gallery = SONG_GALLERY[songLabel];

  const photos = gallery.photos;
  const videos = gallery.videos;

  // Close on Escape, navigate with arrows
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (videoLightboxIndex !== null) { setVideoLightboxIndex(null); return; }
        if (lightboxIndex !== null) { setLightboxIndex(null); return; }
        onClose();
      }
      if (lightboxIndex !== null && photos.length > 0) {
        if (e.key === "ArrowRight") {
          setLightboxIndex((i) => ((i ?? 0) + 1) % photos.length);
        } else if (e.key === "ArrowLeft") {
          setLightboxIndex((i) => ((i ?? 0) - 1 + photos.length) % photos.length);
        }
      }
      if (videoLightboxIndex !== null && videos.length > 0) {
        if (e.key === "ArrowRight") {
          setVideoLightboxIndex((i) => ((i ?? 0) + 1) % videos.length);
        } else if (e.key === "ArrowLeft") {
          setVideoLightboxIndex((i) => ((i ?? 0) - 1 + videos.length) % videos.length);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, videoLightboxIndex, onClose, photos.length, videos.length]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[500]"
        style={{ background: "rgba(0,0,0,0.88)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-0 z-[501] flex items-center justify-center pointer-events-none">
        <div
          className="relative flex flex-col pointer-events-auto gallery-enter overflow-hidden"
          style={{
            width: "min(96vw, 1080px)",
            height: "min(94vh, 820px)",
            background: "#050505",
            border: "1px solid rgba(249,206,15,0.22)",
            boxShadow:
              "0 0 80px rgba(249,206,15,0.06), 0 0 1px rgba(249,206,15,0.3), inset 0 0 80px rgba(0,0,0,0.6)",
          }}
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(249,206,15,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(249,206,15,0.04) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Scanline sweep */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="gallery-scanline" />
          </div>

          {/* Header */}
          <div
            className="relative shrink-0 px-4 py-3"
            style={{ borderBottom: "1px solid rgba(249,206,15,0.14)" }}
          >
            {/* Title row */}
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="flex-1 min-w-0"
                style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <span style={{ color: "rgba(249,206,15,0.3)" }}>&gt;&gt; </span>
                <span style={{ color: "rgba(249,206,15,0.45)" }}>
                  CHIP_DATA /
                </span>
                <span style={{ color: "#f9ce0f", marginLeft: 6 }}>
                  {songLabel}
                </span>
              </div>
              <button className="gallery-btn-close shrink-0" onClick={onClose}>
                <span style={{ fontSize: 15 }}>×</span>
                <span className="hidden sm:inline"> DISCONNECT</span>
                <span className="inline sm:hidden"> ESC</span>
              </button>
            </div>
            {/* Description — own line so it never competes for width */}
            {gallery.description && (
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: "rgba(249,206,15,0.22)",
                  marginTop: 4,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {gallery.description}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div
            className="gallery-tabs-row relative flex shrink-0"
            style={{ borderBottom: "1px solid rgba(249,206,15,0.14)" }}
          >
            {(["AUDIO", "PHOTO_LOG", "VIDEO_FEED"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="gallery-tab shrink-0"
                data-active={tab === t ? "true" : "false"}
              >
                // {t}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="gallery-content relative flex-1 overflow-y-auto p-6">
            {tab === "AUDIO" && <AudioTab gallery={gallery} />}
            {tab === "PHOTO_LOG" && (
              <PhotoTab gallery={gallery} onLightbox={setLightboxIndex} />
            )}
            {tab === "VIDEO_FEED" && (
              <VideoTab gallery={gallery} onLightbox={setVideoLightboxIndex} />
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && photos.length > 0 && (
        <PhotoLightbox
          photos={photos}
          index={lightboxIndex}
          onIndex={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Video Lightbox */}
      {videoLightboxIndex !== null && videos.length > 0 && (
        <VideoLightbox
          videos={videos}
          index={videoLightboxIndex}
          onIndex={setVideoLightboxIndex}
          onClose={() => setVideoLightboxIndex(null)}
        />
      )}
    </>
  );
}
