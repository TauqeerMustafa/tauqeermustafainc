import MonasView from "@/components/layout/MonasView";
import { portfolioDetailsHtml } from "@/data/monas/pages";

export const metadata = {
  title: "Project Case Study | Qorlune",
  description: "Detailed case study analysis and system architecture outcomes.",
};

export default function PortfolioDetailsPage() {
  return <MonasView html={portfolioDetailsHtml} />;
}
