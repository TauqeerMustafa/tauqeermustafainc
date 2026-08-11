export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-none border border-[#E5E5E5]">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="grid grid-cols-3 gap-4 border-b border-[#E5E5E5] bg-white p-4 last:border-b-0"
        >
          <div className="h-3 rounded bg-[#E5E5E5]" />
          <div className="h-3 rounded bg-[#E5E5E5]" />
          <div className="h-3 rounded bg-[#E5E5E5]" />
        </div>
      ))}
    </div>
  );
}
