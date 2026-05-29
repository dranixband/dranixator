export default function LightboxArrow({
  dir,
  onAction,
}: {
  dir: "left" | "right";
  onAction: () => void;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onAction(); }}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); onAction(); }}
      className={`absolute ${dir === "left" ? "left-2 sm:left-6" : "right-2 sm:right-6"} z-10`}
      style={{
        background: "rgba(249,206,15,0.06)",
        border: "1px solid rgba(249,206,15,0.2)",
        color: "#f9ce0f",
        fontFamily: "monospace",
        fontSize: 24,
        width: 44,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(249,206,15,0.12)";
        e.currentTarget.style.borderColor = "rgba(249,206,15,0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(249,206,15,0.06)";
        e.currentTarget.style.borderColor = "rgba(249,206,15,0.2)";
      }}
    >
      {dir === "left" ? "‹" : "›"}
    </button>
  );
}
