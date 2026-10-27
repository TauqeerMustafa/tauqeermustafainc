import MonasView from "@/components/layout/MonasView";
import { homeHtml } from "@/data/monas/pages";

export const metadata = {
  title: "Qorlune | Monas Creative Agency & Portfolio",
  description: "Official Qorlune Creative Engineering and Agency Portfolio.",
};

export default function HomePage() {
  return <MonasView html={homeHtml} />;
}
