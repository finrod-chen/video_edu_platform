"use client";

const days = Array.from({ length: 30 }, (_, i) => i + 1);
// Clearly-fictional sample data — the source tenant's real values were all 0.
const values = [
  0, 0, 1, 0, 2, 1, 0, 3, 2, 1, 0, 0, 1, 4, 2, 1, 0, 2, 3, 1, 0, 1, 2, 0, 1, 3, 2, 1, 0, 1,
];

export function VisitorChart() {
  const max = Math.max(...values, 1);
  const width = 960;
  const height = 200;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - (v / max) * (height - 20) - 10;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full min-w-[720px]" preserveAspectRatio="none">
        <polyline points={points} fill="none" stroke="#2DD4BF" strokeWidth={2} />
        {values.map((v, i) => {
          const x = (i / (values.length - 1)) * width;
          const y = height - (v / max) * (height - 20) - 10;
          return <circle key={i} cx={x} cy={y} r={3} fill="#2DD4BF" />;
        })}
      </svg>
      <div className="mt-1 flex min-w-[720px] justify-between text-[10px] text-[#B0B6C0]">
        {days.map((d) => (
          <span key={d}>8/{d}</span>
        ))}
      </div>
    </div>
  );
}
