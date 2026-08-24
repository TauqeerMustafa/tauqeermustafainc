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
    u("photo-1518186285589-2f7649de83e0"), // dark code on screen
    u("photo-1483058712412-4245e9b90334"), // workspace, laptop, monochrome desk
    u("photo-1504384308090-c894fdcc538d"), // team meeting, glass office
    u("photo-1451187580459-43490279c0fa"), // earth from space / global network feel
  ],
  about: [
    u("photo-1522071820081-009f0129c71c"), // modern office interior
    u("photo-1600880292203-757bb62b4baf"), // office meeting room
  ],
  services: [
    u("photo-1550751827-4bd374c3f58b"), // server racks / infra
    u("photo-1563986768609-322da13575f3"), // security lock concept
    u("photo-1614064641938-3bbee52942c7"), // cybersecurity shield concept
    u("photo-1620712943543-bcc4688e7485"), // AI / circuit board
  ],
  dashboard: [
    u("photo-1551288049-bebda4e38f71"), // analytics dashboard on screen
    u("photo-1460925895917-afdab827c52f"), // growth chart / analytics
    u("photo-1556155092-490a1ba16284"), // finance dashboard
  ],
  backgrounds: [
    u("photo-1451187580459-43490279c0fa"), // abstract dark
    u("photo-1519389950473-47ba0277781c"), // abstract lights bokeh
    u("photo-1517245386807-bb43f82c33c4"), // geometric pattern
    u("photo-1526374965328-7f61d4dc18c5"), // matrix-like code
    u("photo-1550439062-609e1531270e"), // particles / abstract dark
  ],
  people: [
    u("photo-1560250097-0b93528c311a"), // professional portrait
    u("photo-1573497019940-1c28c88b4f3e"), // professional portrait
    u("photo-1519085360753-af0119f7cbe7"), // professional portrait
    u("photo-1580489944761-15a19d654956"), // professional portrait
  ],
  office: [
    u("photo-1497366216548-37526070297c"), // office workspace
    u("photo-1497366811353-6870744d04b2"), // team collaborating
    u("photo-1552664730-d307ca884978"), // meeting room discussion
  ],
} as const;

export type ImageCategory = keyof typeof imageLibrary;
