export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      className="inline-block h-5 w-5 animate-spin rounded-none border-2 border-[#E5E5E5] border-t-[#0A0A0A]"
    />
  );
}
