import type { VideoEntry } from "../../../constants/gallery";
import { useCarousel } from "../hooks/useCarousel";
import { useIsMobile } from "../hooks/useIsMobile";
import { isYoutubeUrl } from "../helpers";
import VideoPlayer from "./VideoPlayer";

export default function VideoLightbox({
  videos,
  index,
  onIndex,
  onClose,
}: {
  videos: VideoEntry[];
  index: number;
  onIndex: React.Dispatch<React.SetStateAction<number | null>>;
  onClose: () => void;
}) {
  const isMobile = useIsMobile();
  const { touchHandlers, stripStyle, prevIdx, nextIdx } = useCarousel(
    videos.length,
    index,
    onIndex,
  );

  function renderVideo(idx: number, isActive: boolean) {
    const v = videos[idx];
    if (isYoutubeUrl(v.src)) {
      return (
        <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", height: 0 }}>
          <iframe
            src={isActive ? `${v.src}?autoplay=1` : v.src}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "1px solid rgba(249,206,15,0.2)" }}
          />
        </div>
      );
    }
    return <VideoPlayer src={v.src} isActive={isActive} />;
  }

  return (
    <div
      className="fixed inset-0 z-[600] flex flex-col items-center justify-center"
      style={{ background: "rgba(0,0,0,0.96)", touchAction: "pan-y" }}
      onClick={onClose}
      {...touchHandlers}
    >
      {/* Carousel strip */}
      <div style={{ width: "100%", overflow: "hidden" }}>
        <div style={stripStyle}>
          {([prevIdx, index, nextIdx] as const).map((idx, slot) => (
            <div
              key={slot}
              style={{
                width: "33.333%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 8px",
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{ width: isMobile ? "96vw" : "min(85vw, 900px)" }}
              >
                {renderVideo(idx, slot === 1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div
        style={{
          fontFamily: "monospace",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          marginTop: 12,
          pointerEvents: "none",
        }}
      >
        <div style={{ fontSize: 13, color: "#f9ce0f" }}>{videos[index].title}</div>
        <div style={{ fontSize: 10, color: "rgba(249,206,15,0.35)" }}>
          {videos[index].date} &nbsp;·&nbsp; {index + 1}/{videos.length}
        </div>
      </div>

      {/* Arrows — below video to avoid overlapping native controls */}
      {videos.length > 1 && (
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          {(["left", "right"] as const).map((dir) => {
            const action = () => onIndex((i) =>
              dir === "left"
                ? ((i ?? 0) - 1 + videos.length) % videos.length
                : ((i ?? 0) + 1) % videos.length
            );
            return (
              <button
                key={dir}
                onClick={(e) => { e.stopPropagation(); action(); }}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); action(); }}
                style={{
                  background: "rgba(249,206,15,0.06)",
                  border: "1px solid rgba(249,206,15,0.2)",
                  color: "#f9ce0f",
                  fontFamily: "monospace",
                  fontSize: 20,
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {dir === "left" ? "‹" : "›"}
              </button>
            );
          })}
        </div>
      )}

      {/* Close */}
      <div
        className="absolute top-6 right-8"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        style={{ fontFamily: "monospace", fontSize: 12, color: "#f9ce0f", border: "1px solid #f9ce0f", padding: "4px 12px", cursor: "pointer" }}
      >
        × CLOSE
      </div>
    </div>
  );
}
