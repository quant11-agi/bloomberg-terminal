/** Shared SVG sparkline component used in Forex and Commodities views. */
export default function Sparkline({
  data,
  positive,
  large,
}: {
  data: number[];
  positive: boolean;
  large?: boolean;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = large ? 96 : 40;
  const w = large ? 280 : 150;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "var(--bb-green)" : "var(--bb-red)"}
        strokeWidth={large ? 2 : 1.5}
      />
    </svg>
  );
}
