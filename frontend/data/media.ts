export const imageLibrary = {
  hero: [
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-hero-digital_cs7bvl.jpg",
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-hero-code_ub9idm.jpg",
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-hero-network_ecqwdg.jpg",
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-hero-globe_qob1ag.jpg",
  ],
  about: [
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442686/tmi-about-office_ugfz0w.jpg",
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442686/tmi-about-business_cbqaaq.jpg",
  ],
  services: [
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442692/tmi-service-global-network_cuiryi.jpg",
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442692/tmi-service-data-security_oxjb4l.jpg",
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442692/tmi-service-cyber-shield_cly3ur.jpg",
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442690/tmi-service-ai-security_lgghxl.jpg",
  ],
  dashboard: [
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442687/tmi-dashboard-market_pttc2n.jpg",
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442687/tmi-dashboard-growth_pfmdpk.jpg",
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442688/tmi-dashboard-finance_w2mvtk.jpg",
  ],
  backgrounds: [
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442689/tmi-bg-abstract_a8lsu9.jpg",
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442687/tmi-bg-bokeh_lffzh9.jpg",
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442686/tmi-bg-hexagon_clrisv.jpg",
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442686/tmi-bg-matrix_w1xjjh.jpg",
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442687/tmi-bg-particles_pcaegw.jpg",
  ],
  logo: [
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442690/tmi-logo-primary_tppirj.jpg",
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442689/tmi-logo-gold_zbexsa.jpg",
    "https://res.cloudinary.com/b5cle1jv/image/upload/v1785442689/tmi-logo-badge_cfkewe.jpg",
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
