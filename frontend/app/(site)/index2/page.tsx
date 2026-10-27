import MonasView from "@/components/layout/MonasView";
import { index2Html } from "@/data/monas/pages";

export const metadata = {
  title: "Developer Portfolio | Qorlune",
  description: "Monas Developer Home layout for modern fullstack software engineers.",
};

export default function Index2Page() {
  return <MonasView html={index2Html} />;
}
