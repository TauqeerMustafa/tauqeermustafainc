import MonasView from "@/components/layout/MonasView";
import { servicesHtml } from "@/data/monas/pages";

export const metadata = {
  title: "Services | Qorlune",
  description: "Enterprise digital services, web engineering, AI, and systems architecture.",
};

export default function ServicesPage() {
  return <MonasView html={servicesHtml} />;
}
