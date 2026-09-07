export function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="rounded-none border border-line bg-white p-7 shadow-sm"
    >
      <div className="h-4 w-24 rounded bg-line" />
      <div className="mt-6 h-6 w-3/4 rounded bg-line" />
      <div className="mt-4 space-y-3">
        <div className="h-3 rounded bg-line" />
        <div className="h-3 w-5/6 rounded bg-line" />
      </div>
    </div>
  );
}
