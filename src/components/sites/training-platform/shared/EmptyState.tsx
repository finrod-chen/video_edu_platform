export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="text-[#D7DBE3]">
        <rect x="4" y="4" width="48" height="48" rx="8" strokeWidth="2" stroke="currentColor" strokeDasharray="4 4" />
        <path d="M20 34l6-8 5 6 5-7 6 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-sm font-medium text-[#8B93A1]">{title}</p>
      {description && <p className="text-xs text-[#B0B6C0]">{description}</p>}
    </div>
  );
}
