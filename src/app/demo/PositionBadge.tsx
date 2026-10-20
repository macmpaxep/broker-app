export default function PositionBadge({ side }: { side: "long" | "short" }) {
  const isLong = side === "long";
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
      style={{
        background: "var(--vx-surface-2)",
        color: isLong ? "var(--vx-positive)" : "var(--vx-negative)",
      }}
    >
      {isLong ? "Long" : "Short"}
    </span>
  );
}
