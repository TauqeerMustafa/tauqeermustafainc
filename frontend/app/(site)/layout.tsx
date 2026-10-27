import MonasScripts from "@/components/layout/MonasScripts";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Sofia&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="/assets/css/vendor/bootstrap.min.css" />
      <link rel="stylesheet" href="/assets/css/vendor/animate.min.css" />
      <link rel="stylesheet" href="/assets/css/vendor/odometer.min.css" />
      <link rel="stylesheet" href="/assets/css/plugins/swiper.min.css" />
      <link rel="stylesheet" href="/assets/css/vendor/magnific-popup.css" />
      <link rel="stylesheet" href="/assets/css/vendor/fontawesome-pro.css" />
      <link rel="stylesheet" href="/assets/css/vendor/spacing.css" />
      <link rel="stylesheet" href="/assets/css/vendor/custom-font.css" />
      <link rel="stylesheet" href="/assets/css/main.css" />

      {children}

      <MonasScripts />
    </>
  );
}
