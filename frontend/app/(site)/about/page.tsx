import MonasView from "@/components/layout/MonasView";
import { aboutHtml } from "@/data/monas/pages";

export const metadata = {
  title: "About Us | Qorlune",
  description: "About Qorlune creative engineering, history, and capabilities.",
};

export default function AboutPage() {
  return <MonasView html={aboutHtml} />;
}
