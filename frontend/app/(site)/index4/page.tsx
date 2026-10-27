import MonasView from "@/components/layout/MonasView";
import { index4Html } from "@/data/monas/pages";

export const metadata = {
  title: "Media & Agency Portfolio | Qorlune",
  description: "Monas Media and Creative Director Home layout.",
};

export default function Index4Page() {
  return <MonasView html={index4Html} />;
}
