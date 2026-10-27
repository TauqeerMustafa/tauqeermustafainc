import MonasView from "@/components/layout/MonasView";
import { blogDetailsHtml } from "@/data/monas/pages";

export const metadata = {
  title: "Article Details | Qorlune",
  description: "In-depth engineering article and field observations.",
};

export default function BlogDetailsPage() {
  return <MonasView html={blogDetailsHtml} />;
}
