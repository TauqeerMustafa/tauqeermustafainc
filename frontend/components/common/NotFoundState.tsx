import { EmptyState } from "@/components/common/EmptyState";

export function NotFoundState() {
  return (
    <EmptyState
      title="Page not found"
      message="The page you are looking for does not exist or has moved."
    />
  );
}
