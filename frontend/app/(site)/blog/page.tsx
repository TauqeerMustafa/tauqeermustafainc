import MonasView from "@/components/layout/MonasView";
import { blogHtml } from "@/data/monas/pages";

export const metadata = {
  title: "Blog & Articles | Qorlune",
  description: "Technical publications, engineering field notes, and architectural patterns.",
};

export default function BlogPage() {
  return <MonasView html={blogHtml} />;
}
