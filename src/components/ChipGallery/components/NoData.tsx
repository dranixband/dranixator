export default function NoData({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 200,
        gap: 12,
      }}
    >
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: "rgba(249,206,15,0.18)",
          letterSpacing: 3,
        }}
      >
        // {label}
      </div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: "rgba(249,206,15,0.1)",
        }}
      >
        data will be uploaded soon
      </div>
    </div>
  );
}
