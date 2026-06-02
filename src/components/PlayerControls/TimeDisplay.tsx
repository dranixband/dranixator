interface Props {
  current: number; // seconds
  duration: number; // seconds
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function TimeDisplay({ current, duration }: Props) {
  return (
    <span
      style={{
        fontFamily: "monospace",
        fontSize: 10,
        color: "rgba(249,206,15,0.45)",
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      {fmt(current)} / {duration > 0 ? fmt(duration) : "--:--"}
    </span>
  );
}
