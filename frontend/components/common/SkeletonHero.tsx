export function SkeletonHero() {
  return (
    <div aria-hidden="true" className="border-b border-line bg-white px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="h-4 w-32 rounded bg-line" />
        <div className="mt-6 h-12 max-w-3xl rounded bg-line" />
        <div className="mt-5 h-4 max-w-2xl rounded bg-line" />
        <div className="mt-3 h-4 max-w-xl rounded bg-line" />
      </div>
    </div>
  );
}
