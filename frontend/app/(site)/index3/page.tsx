import MonasView from "@/components/layout/MonasView";
import { index3Html } from "@/data/monas/pages";

export const metadata = {
  title: "Corporate Portfolio | Qorlune",
  description: "Monas Executive & Consulting Home layout.",
};

export default function Index3Page() {
  return <MonasView html={index3Html} />;
}
