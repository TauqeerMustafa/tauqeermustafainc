import { ErrorState } from "@/components/common/ErrorState";

export function NetworkErrorState() {
  return (
    <ErrorState
      title="Network error"
      message="The application could not reach the server. Check your connection and try again."
    />
  );
}
