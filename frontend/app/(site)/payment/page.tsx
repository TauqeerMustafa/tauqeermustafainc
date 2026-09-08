import { redirect } from "next/navigation";

export default function PaymentRedirectPage() {
  redirect("/pay");
}
