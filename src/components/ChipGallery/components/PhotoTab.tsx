import type { SongGallery } from "../../../constants/gallery";
import NoData from "./NoData";

export default function PhotoTab({
  gallery,
  onLightbox,
}: {
  gallery: SongGallery;
  onLightbox: (index: number) => void;
}) {
  if (gallery.photos.length === 0) {
    return <NoData label="NO_PHOTO_LOG" />;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 8,
      }}
    >
      {gallery.photos.map((photo, i) => (
        <div
          key={i}
          onClick={() => onLightbox(i)}
          style={{
            aspectRatio: "1",
            overflow: "hidden",
            cursor: "pointer",
            border: "1px solid rgba(249,206,15,0.1)",
            transition: "border-color 0.15s, transform 0.15s",
            position: "relative",
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
          <img
            src={photo.src}
            alt={photo.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
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
              {photo.title}
            </div>
            <div style={{ fontSize: 9, color: "rgba(249,206,15,0.35)" }}>
              {photo.date}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
