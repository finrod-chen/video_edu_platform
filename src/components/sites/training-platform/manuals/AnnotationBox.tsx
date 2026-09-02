import type { ManualStepAnnotation } from "@/types/models";

export function AnnotationBox({
  a,
  interactive,
  selected,
  onSelect,
}: {
  a: ManualStepAnnotation;
  interactive?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const boxStyle: React.CSSProperties = {
    position: "absolute",
    left: `${a.x}%`,
    top: `${a.y}%`,
    width: `${a.width}%`,
    height: `${a.height}%`,
    cursor: interactive ? "pointer" : undefined,
    outline: selected ? "2px solid #38761D" : undefined,
    outlineOffset: selected ? "2px" : undefined,
  };
  const interactiveProps = interactive
    ? {
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          onSelect?.();
        },
        role: "button" as const,
        tabIndex: 0,
      }
    : {};

  if (a.type === "text") {
    return (
      <div
        style={boxStyle}
        className="flex items-center justify-center rounded bg-black/70 px-2 py-1 text-sm font-medium text-white"
        {...interactiveProps}
      >
        {a.text}
      </div>
    );
  }
  if (a.type === "rect") {
    return (
      <div
        style={{ ...boxStyle, borderColor: a.color ?? "#ef4444" }}
        className="rounded border-4"
        {...interactiveProps}
      />
    );
  }
  if (a.type === "blur") {
    return (
      <div
        style={{ ...boxStyle, backdropFilter: "blur(12px)" }}
        className="rounded"
        {...interactiveProps}
      />
    );
  }
  // arrow: draw a line from top-left to bottom-right of the box via SVG
  return (
    <svg style={boxStyle} className="overflow-visible" {...interactiveProps}>
      {interactive && <rect x="0" y="0" width="100%" height="100%" fill="transparent" />}
      <defs>
        <marker id={`arrowhead-${a.id}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={a.color ?? "#ef4444"} />
        </marker>
      </defs>
      <line
        x1="0"
        y1="0"
        x2="100%"
        y2="100%"
        stroke={a.color ?? "#ef4444"}
        strokeWidth={3}
        markerEnd={`url(#arrowhead-${a.id})`}
      />
    </svg>
  );
}
