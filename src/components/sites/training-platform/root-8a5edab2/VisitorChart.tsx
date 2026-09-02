import type { VisitorDataPoint } from "@/types/models";

export function VisitorChart({ series }: { series: VisitorDataPoint[] }) {
  if (series.length === 0) {
    return <p className="py-16 text-center text-sm text-[#8B93A1]">沒有數據</p>;
  }

  const values = series.map((d) => d.visitors);
  const max = Math.max(...values, 1);
  const width = 960;
  const height = 200;
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * width;
      const y = height - (v / max) * (height - 20) - 10;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full min-w-[720px]" preserveAspectRatio="none">
        <polyline points={points} fill="none" stroke="#2DD4BF" strokeWidth={2} />
        {values.map((v, i) => {
          const x = (i / Math.max(values.length - 1, 1)) * width;
          const y = height - (v / max) * (height - 20) - 10;
          return <circle key={i} cx={x} cy={y} r={3} fill="#2DD4BF" />;
        })}
      </svg>
      <div className="mt-1 flex min-w-[720px] justify-between text-[10px] text-[#B0B6C0]">
        {series.map((d) => (
          <span key={d.date}>{d.date.slice(5).replace("-", "/")}</span>
        ))}
      </div>
    </div>
  );
}
