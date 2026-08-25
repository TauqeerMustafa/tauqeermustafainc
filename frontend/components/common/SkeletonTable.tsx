export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-none border border-[#e2ded9]">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="grid grid-cols-3 gap-4 border-b border-[#e2ded9] bg-white p-4 last:border-b-0"
        >
          <div className="h-3 rounded bg-[#e2ded9]" />
          <div className="h-3 rounded bg-[#e2ded9]" />
          <div className="h-3 rounded bg-[#e2ded9]" />
        </div>
      ))}
    </div>
  );
}
