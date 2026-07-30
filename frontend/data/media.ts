export const imageLibrary = {
  hero: [
    "/images/hero/tmi-hero-digital.jpg",
    "/images/hero/tmi-hero-code.jpg",
    "/images/hero/tmi-hero-network.jpg",
    "/images/hero/tmi-hero-globe.jpg",
  ],
  about: [
    "/images/about/tmi-about-office.jpg",
    "/images/about/tmi-about-business.jpg",
  ],
  services: [
    "/images/services/tmi-service-global-network.jpg",
    "/images/services/tmi-service-data-security.jpg",
    "/images/services/tmi-service-cyber-shield.jpg",
    "/images/services/tmi-service-ai-security.jpg",
  ],
  dashboard: [
    "/images/dashboard/tmi-dashboard-market.jpg",
    "/images/dashboard/tmi-dashboard-growth.jpg",
    "/images/dashboard/tmi-dashboard-finance.jpg",
  ],
  backgrounds: [
    "/images/backgrounds/tmi-bg-abstract.jpg",
    "/images/backgrounds/tmi-bg-bokeh.jpg",
    "/images/backgrounds/tmi-bg-hexagon.jpg",
    "/images/backgrounds/tmi-bg-matrix.jpg",
    "/images/backgrounds/tmi-bg-particles.jpg",
  ],
  logo: [
    "/images/logo/tmi-logo-primary.jpg",
    "/images/logo/tmi-logo-gold.jpg",
    "/images/logo/tmi-logo-badge.jpg",
  ],
  raw: [],
} as const;

export const allProjectImages = [
  ...imageLibrary.hero,
  ...imageLibrary.about,
  ...imageLibrary.services,
  ...imageLibrary.dashboard,
  ...imageLibrary.backgrounds,
  ...imageLibrary.logo,
  ...imageLibrary.raw,
];
