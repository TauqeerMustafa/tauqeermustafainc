export type CommunityPost = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  initials: string;
  role: string;
  time: string;
  category: string;
  replies: number;
  likes: number;
  views: number;
  tags: string[];
  featured?: boolean;
  solved?: boolean;
};

export type CommunityMember = {
  name: string;
  initials: string;
  role: string;
  location: string;
  specialty: string;
  contribution: string;
  accent: string;
};

export const communityTopics = [
  { name: "All conversations", count: 248 },
  { name: "Build in public", count: 84 },
  { name: "Security", count: 52 },
  { name: "AI & automation", count: 46 },
  { name: "Career & craft", count: 38 },
  { name: "Community news", count: 28 },
];

export const communityPosts: CommunityPost[] = [
  {
    slug: "shipping-a-secure-ai-feature",
    title: "How we shipped a secure AI feature without slowing the product down",
    excerpt:
      "A practical look at threat modeling, prompt boundaries, and the small review ritual that helped our team move quickly without treating security as a final checkbox.",
    author: "Ayesha Khan",
    initials: "AK",
    role: "Product engineer",
    time: "18 min ago",
    category: "Security",
    replies: 24,
    likes: 91,
    views: 1240,
    tags: ["security", "ai", "shipping"],
    featured: true,
    solved: true,
  },
  {
    slug: "show-your-work-micro-saas",
    title: "Show your work: a calmer way to run a tiny SaaS",
    excerpt:
      "I replaced five dashboards with one weekly operating note. Sharing the format, what it tracks, and the parts that made the biggest difference to our small team.",
    author: "Omar Farooq",
    initials: "OF",
    role: "Indie maker",
    time: "42 min ago",
    category: "Build in public",
    replies: 16,
    likes: 63,
    views: 876,
    tags: ["indie", "process", "saas"],
  },
  {
    slug: "choosing-a-stack-for-ai-products",
    title: "Choosing a stack for AI products in 2026",
    excerpt:
      "The stack decision is rarely about the newest tool. Here is a decision tree for choosing foundations that keep your options open as usage, risk, and product clarity change.",
    author: "Mina Patel",
    initials: "MP",
    role: "Staff software engineer",
    time: "1 hr ago",
    category: "AI & automation",
    replies: 31,
    likes: 118,
    views: 1922,
    tags: ["architecture", "ai", "decisions"],
  },
  {
    slug: "the-first-30-days-as-a-security-lead",
    title: "The first 30 days as a security lead",
    excerpt:
      "A field guide for turning a long list of unknowns into visible, owned, and repeatable security work without overwhelming the people you need beside you.",
    author: "Daniel Wu",
    initials: "DW",
    role: "Security lead",
    time: "2 hrs ago",
    category: "Career & craft",
    replies: 12,
    likes: 47,
    views: 714,
    tags: ["leadership", "security", "career"],
  },
  {
    slug: "community-office-hours-june",
    title: "June office hours: bring the hard product questions",
    excerpt:
      "Our next open session is about the decisions that do not fit neatly into a tutorial: scope, trade-offs, risk, and how to know when a prototype is ready for real users.",
    author: "TMI Community",
    initials: "TM",
    role: "Community team",
    time: "Yesterday",
    category: "Community news",
    replies: 8,
    likes: 39,
    views: 608,
    tags: ["events", "office-hours"],
  },
];

export const communityMembers: CommunityMember[] = [
  { name: "Ayesha Khan", initials: "AK", role: "Product engineer", location: "Lahore, PK", specialty: "Secure AI systems", contribution: "18 conversations", accent: "#1c69d4" },
  { name: "Omar Farooq", initials: "OF", role: "Indie maker", location: "Dubai, UAE", specialty: "Product systems", contribution: "12 conversations", accent: "#e22718" },
  { name: "Mina Patel", initials: "MP", role: "Staff engineer", location: "London, UK", specialty: "Platform architecture", contribution: "27 conversations", accent: "#0066b1" },
  { name: "Daniel Wu", initials: "DW", role: "Security lead", location: "Toronto, CA", specialty: "Application security", contribution: "9 conversations", accent: "#1c69d4" },
  { name: "Sara Ahmed", initials: "SA", role: "Design technologist", location: "Karachi, PK", specialty: "Human-centred systems", contribution: "14 conversations", accent: "#e22718" },
  { name: "Leo Martins", initials: "LM", role: "Cloud architect", location: "Lisbon, PT", specialty: "Reliable infrastructure", contribution: "21 conversations", accent: "#0066b1" },
];

export const communityStats = [
  { value: "4.8k", label: "members building" },
  { value: "248", label: "conversations" },
  { value: "36", label: "countries represented" },
];

export const communityGuidelines = [
  { number: "01", title: "Make it useful", body: "Share context, decisions, and learnings that help someone else take a clearer next step." },
  { number: "02", title: "Assume good intent", body: "Disagree with the idea, not the person. Ask before you infer and leave room for nuance." },
  { number: "03", title: "Protect the room", body: "Never share private data, credentials, or confidential client information in a post or screenshot." },
  { number: "04", title: "Keep the signal high", body: "No spam, empty promotion, or copied content. If you build something, tell us what you learned." },
];

export function getCommunityPost(slug: string) {
  return communityPosts.find((post) => post.slug === slug);
}
