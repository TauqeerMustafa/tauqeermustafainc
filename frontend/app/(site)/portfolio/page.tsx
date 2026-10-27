import MonasView from "@/components/layout/MonasView";
import { portfolioHtml } from "@/data/monas/pages";

export const metadata = {
  title: "Projects & Portfolio | Qorlune",
  description: "Featured engineering projects and portfolio case studies.",
};

export default function PortfolioPage() {
  return <MonasView html={portfolioHtml} />;
}
