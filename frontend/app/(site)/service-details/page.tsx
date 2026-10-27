import MonasView from "@/components/layout/MonasView";
import { serviceDetailsHtml } from "@/data/monas/pages";

export const metadata = {
  title: "Service Details | Qorlune",
  description: "Detailed service specifications and delivery blueprints.",
};

export default function ServiceDetailsPage() {
  return <MonasView html={serviceDetailsHtml} />;
}
