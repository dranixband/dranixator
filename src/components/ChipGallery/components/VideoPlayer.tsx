import { useState } from "react";

export default function VideoPlayer({ src, isActive }: { src: string; isActive: boolean }) {
  const [isPortrait, setIsPortrait] = useState(false);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        background: "#000",
        border: "1px solid rgba(249,206,15,0.2)",
      }}
    >
      <video
        key={src}
        src={src}
        controls={isActive}
        autoPlay={isActive}
        muted={!isActive}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          setIsPortrait(v.videoHeight > v.videoWidth);
        }}
        style={{
          display: "block",
          maxHeight: "75vh",
          width: isPortrait ? "auto" : "100%",
          maxWidth: "100%",
        }}
      />
    </div>
  );
}
