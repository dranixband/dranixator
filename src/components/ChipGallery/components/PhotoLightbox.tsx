import type { PhotoEntry } from "../../../constants/gallery";
import { useCarousel } from "../hooks/useCarousel";
import LightboxArrow from "./LightboxArrow";

export default function PhotoLightbox({
  photos,
  index,
  onIndex,
  onClose,
}: {
  photos: PhotoEntry[];
  index: number;
  onIndex: React.Dispatch<React.SetStateAction<number | null>>;
  onClose: () => void;
}) {
  const { touchHandlers, stripStyle, prevIdx, nextIdx } = useCarousel(
    photos.length,
    index,
    onIndex,
  );

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
          {[prevIdx, index, nextIdx].map((idx, slot) => (
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
              <img
                src={photos[idx].src}
                alt={photos[idx].title}
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: "90vw",
                  maxHeight: "75vh",
                  objectFit: "contain",
                  border: "1px solid rgba(249,206,15,0.2)",
                  display: "block",
                }}
              />
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
        <div style={{ fontSize: 13, color: "#f9ce0f" }}>{photos[index].title}</div>
        <div style={{ fontSize: 10, color: "rgba(249,206,15,0.35)" }}>
          {photos[index].date} &nbsp;·&nbsp; {index + 1}/{photos.length}
        </div>
      </div>

      {/* Arrows */}
      {photos.length > 1 && (
        <>
          <LightboxArrow dir="left" onAction={() => onIndex((i) => ((i ?? 0) - 1 + photos.length) % photos.length)} />
          <LightboxArrow dir="right" onAction={() => onIndex((i) => ((i ?? 0) + 1) % photos.length)} />
        </>
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
