interface Props {
  isMobile: boolean;
  playerOpen: boolean;
  skipReview: boolean;
  saboteur: boolean;
  onSkipReviewChange: (v: boolean) => void;
  onSaboteurChange: (v: boolean) => void;
  onConnectAll: () => void;
}

export default function DevTools({
  isMobile,
  playerOpen,
  skipReview,
  saboteur,
  onSkipReviewChange,
  onSaboteurChange,
  onConnectAll,
}: Props) {
  const BASE_POS = "fixed bottom-16 left-4";
  const mobileClass = playerOpen ? "fixed bottom-35 left-4" : BASE_POS;
  return (
    <div
      className={isMobile ? mobileClass : BASE_POS}
      style={{
        zIndex: 100,
        background: "rgba(0,0,0,0.85)",
        border: "1px solid rgba(249,206,15,0.2)",
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: "'Barlow', sans-serif",
        fontSize: 11,
        color: "rgba(255,255,255,0.6)",
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: "rgba(249,206,15,0.5)",
          marginBottom: 8,
          letterSpacing: 1,
        }}
      >
        DEV TOOLS
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={skipReview}
          onChange={(e) => onSkipReviewChange(e.target.checked)}
          style={{ accentColor: "#f9ce0f" }}
        />
        Skip reviews
      </label>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          marginTop: 6,
          color: saboteur ? "rgba(239,68,68,0.9)" : "rgba(255,255,255,0.6)",
        }}
      >
        <input
          type="checkbox"
          checked={saboteur}
          onChange={(e) => onSaboteurChange(e.target.checked)}
          style={{ accentColor: "#ef4444" }}
        />
        Saboteur
      </label>
      <button
        onClick={onConnectAll}
        style={{
          marginTop: 10,
          width: "100%",
          padding: "5px 0",
          background: "rgba(249,206,15,0.07)",
          border: "1px solid rgba(249,206,15,0.3)",
          color: "rgba(249,206,15,0.8)",
          fontFamily: "monospace",
          fontSize: 10,
          letterSpacing: 1,
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(249,206,15,0.14)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(249,206,15,0.07)")}
      >
        Connect all chips
      </button>
    </div>
  );
}
