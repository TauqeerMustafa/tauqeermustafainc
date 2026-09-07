export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-none border border-line">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="grid grid-cols-3 gap-4 border-b border-line bg-white p-4 last:border-b-0"
        >
          <div className="h-3 rounded bg-line" />
          <div className="h-3 rounded bg-line" />
          <div className="h-3 rounded bg-line" />
        </div>
      ))}
    </div>
  );
}
