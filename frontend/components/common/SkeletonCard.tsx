export function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="rounded-none border border-[#e2ded9] bg-white p-7 shadow-sm"
    >
      <div className="h-4 w-24 rounded bg-[#e2ded9]" />
      <div className="mt-6 h-6 w-3/4 rounded bg-[#e2ded9]" />
      <div className="mt-4 space-y-3">
        <div className="h-3 rounded bg-[#e2ded9]" />
        <div className="h-3 w-5/6 rounded bg-[#e2ded9]" />
      </div>
    </div>
  );
}
