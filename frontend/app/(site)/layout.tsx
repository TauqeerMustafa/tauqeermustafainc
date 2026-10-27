import MonasNavbar from "@/components/layout/MonasNavbar";
import MonasFooter from "@/components/layout/MonasFooter";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <link rel="stylesheet" href="/assets/css/vendor/bootstrap.min.css" />
      <link rel="stylesheet" href="/assets/css/vendor/animate.min.css" />
      <link rel="stylesheet" href="/assets/css/vendor/odometer.min.css" />
      <link rel="stylesheet" href="/assets/css/plugins/swiper.min.css" />
      <link rel="stylesheet" href="/assets/css/vendor/magnific-popup.css" />
      <link rel="stylesheet" href="/assets/css/vendor/fontawesome-pro.css" />
      <link rel="stylesheet" href="/assets/css/vendor/spacing.css" />
      <link rel="stylesheet" href="/assets/css/vendor/custom-font.css" />
      <link rel="stylesheet" href="/assets/css/main.css" />

      <MonasNavbar />

      <main className="flex-1" style={{ background: "#0f0f11", minHeight: "100vh" }}>
        {children}
      </main>

      <MonasFooter />
    </>
  );
}
