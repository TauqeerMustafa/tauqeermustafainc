/**
 * Centralized image library.
 *
 * All images are sourced from Unsplash (unsplash.com), free to use under the
 * Unsplash License (no attribution required, commercial use permitted).
 * Fixed photo IDs are used via images.unsplash.com so URLs are stable.
 */

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const imageLibrary = {
  hero: [
    u("photo-1517694712202-14dd9538aa97"), // MacBook with code — clean dark theme
    u("photo-1593642632559-0c6d3fc62b89"), // laptop on minimal dark desk
    u("photo-1558494949-ef010cbdcc31"),     // server room / data center
    u("photo-1451187580459-43490279c0fa"), // global network / earth from space
  ],
  about: [
    u("photo-1573164713714-d95e436ab8d6"), // engineer at multiple monitors
    u("photo-1522071820081-009f0129c71c"), // modern collaborative office
  ],
  services: [
    u("photo-1547658719-da2b51169166"), // web design on clean screen
    u("photo-1614064641938-3bbee52942c7"), // cybersecurity shield concept
    u("photo-1677442135703-1787eea5ce01"), // AI / generative neural network
    u("photo-1544197150-b99a580bb7a8"), // cloud data centre — cables & racks
  ],
  dashboard: [
    u("photo-1551288049-bebda4e38f71"), // analytics dashboard on screen
    u("photo-1460925895917-afdab827c52f"), // growth chart / analytics
    u("photo-1590859808308-3d2d9c515b1a"), // financial trading dashboard
  ],
  backgrounds: [
    u("photo-1451187580459-43490279c0fa"), // abstract dark — global grid
    u("photo-1519389950473-47ba0277781c"), // abstract lights bokeh
    u("photo-1517245386807-bb43f82c33c4"), // geometric dark pattern
    u("photo-1526374965328-7f61d4dc18c5"), // matrix-style code stream
    u("photo-1550439062-609e1531270e"), // particles / abstract dark
  ],
  people: [
    u("photo-1560250097-0b93528c311a"), // professional portrait M
    u("photo-1573497019940-1c28c88b4f3e"), // professional portrait F
    u("photo-1519085360753-af0119f7cbe7"), // professional portrait M
    u("photo-1580489944761-15a19d654956"), // professional portrait F
  ],
  office: [
    u("photo-1497366216548-37526070297c"), // minimal office workspace
    u("photo-1497366811353-6870744d04b2"), // team collaborating around table
    u("photo-1552664730-d307ca884978"), // focused meeting room discussion
  ],
} as const;

export type ImageCategory = keyof typeof imageLibrary;
