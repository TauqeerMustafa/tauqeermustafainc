export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#C9A227]"
    />
  );
}
