import MonasView from "@/components/layout/MonasView";
import { contactHtml } from "@/data/monas/pages";

export const metadata = {
  title: "Contact Us | Qorlune",
  description: "Get in touch with the Qorlune team for consultations and partnerships.",
};

export default function ContactPage() {
  return <MonasView html={contactHtml} />;
}
