import { redirect } from "next/navigation";

export default function ClientPortalEntryPage() {
  redirect("/client/login");
}
