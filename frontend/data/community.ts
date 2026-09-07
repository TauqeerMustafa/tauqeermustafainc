export type CommunityPost = {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  quote?: string;
  author: string;
  initials: string;
  role: string;
  time: string;
  publishedAt: string;
  readTime: string;
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
  bio: string;
  joined: string;
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
    excerpt: "A practical field note on threat modeling, prompt boundaries, and the small review ritual that helped a product team move quickly without treating security as a final checkbox.",
    body: [
      "When our support team asked for an assistant that could summarize customer conversations, the first instinct was to start with the model. We started somewhere less exciting: mapping what the assistant must never see, infer, or send back.",
      "The team drew a narrow trust boundary around the feature, added redaction before retrieval, and wrote twelve failure cases before the first prototype reached a real user. That work did not slow the launch. It made the decision surface small enough for everyone to understand.",
      "Our final review was a 25-minute ritual at the end of each sprint. Product, engineering, and security recorded one decision, one residual risk, and one owner. The format was deliberately lightweight so it could survive a busy week.",
    ],
    quote: "The best systems make the safe path the easy path.",
    author: "Ayesha Khan",
    initials: "AK",
    role: "Product engineer",
    time: "Mar 14, 2026",
    publishedAt: "2026-03-14",
    readTime: "7 min read",
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
    excerpt: "I replaced five dashboards with one weekly operating note. Here is the format, the signals it tracks, and the quiet decisions that made the biggest difference to a small distributed team.",
    body: [
      "For most of last year, our team had more dashboards than decisions. Every metric was technically useful, but the volume made it hard to see what deserved attention now and what could wait until next week.",
      "We replaced the collection with a single operating note: three customer signals, one reliability signal, one commercial question, and a short list of decisions. The note is written every Friday and read before Monday planning.",
      "The most valuable change was not the format itself. It was the permission to leave numbers unexplained until we had enough context to act. Calm operations are not passive; they are selective.",
    ],
    quote: "A smaller surface for attention creates a larger surface for good work.",
    author: "Omar Farooq",
    initials: "OF",
    role: "Indie maker",
    time: "Jan 29, 2026",
    publishedAt: "2026-01-29",
    readTime: "6 min read",
    category: "Build in public",
    replies: 16,
    likes: 63,
    views: 876,
    tags: ["indie", "process", "saas"],
  },
  {
    slug: "choosing-a-stack-for-ai-products",
    title: "Choosing a stack for AI products in 2025",
    excerpt: "The stack decision is rarely about the newest tool. This decision tree focuses on foundations that keep options open as usage, risk, and product clarity change.",
    body: [
      "A promising AI product can outgrow its first architecture quickly, but novelty is not the only source of risk. The harder problem is choosing which parts should remain replaceable and which parts deserve the discipline of a long-lived platform.",
      "We now begin with four questions: what must be deterministic, what can be probabilistic, what data may leave the system, and which workflow needs a human decision. Those answers usually narrow the stack more effectively than a feature comparison.",
      "The result is a deliberately boring core: clear interfaces, observable jobs, provider-agnostic prompts, and a small evaluation set that runs before every meaningful release. The interesting work belongs at the product edge.",
    ],
    quote: "Choose foundations for the decisions you expect to revisit, not the demos you want to show once.",
    author: "Mina Patel",
    initials: "MP",
    role: "Staff software engineer",
    time: "Nov 18, 2025",
    publishedAt: "2025-11-18",
    readTime: "8 min read",
    category: "AI & automation",
    replies: 31,
    likes: 118,
    views: 1922,
    tags: ["architecture", "ai", "decisions"],
  },
  {
    slug: "the-first-30-days-as-a-security-lead",
    title: "The first 30 days as a security lead",
    excerpt: "A field guide for turning a long list of unknowns into visible, owned, and repeatable security work without overwhelming the people you need beside you.",
    body: [
      "The first month in a security leadership role is often presented as a race to find every gap. In practice, the highest-leverage move is to make the current shape of risk legible without turning the organization defensive.",
      "My first week was spent listening: to engineers, customer-facing teams, legal, and the people who respond when a system behaves unexpectedly. Their language revealed where controls were already strong and where the process relied on one person remembering one thing.",
      "By day thirty, we had a short risk register, named owners, a regular review, and a promise that every new control would make a real workflow easier rather than simply add ceremony.",
    ],
    quote: "Visibility is not the destination. It is the condition that makes ownership possible.",
    author: "Daniel Wu",
    initials: "DW",
    role: "Security lead",
    time: "Aug 07, 2025",
    publishedAt: "2025-08-07",
    readTime: "5 min read",
    category: "Career & craft",
    replies: 12,
    likes: 47,
    views: 714,
    tags: ["leadership", "security", "career"],
  },
  {
    slug: "community-office-hours-june",
    title: "June office hours: bring the hard product questions",
    excerpt: "Our next open session is for the decisions that do not fit neatly into a tutorial: scope, trade-offs, risk, and knowing when a prototype is ready for real users.",
    body: [
      "Office hours are intentionally small. Bring the decision that keeps moving from one planning cycle to the next, the prototype you are not sure how to explain, or the risk that has no obvious owner yet.",
      "There is no slide deck and no expectation that a question arrive polished. We will spend the first few minutes making the context clear, then use the room to test assumptions and identify a practical next step.",
      "The session is open to builders at every stage. You can listen quietly, share a pattern, or leave with a sharper question than the one you brought in.",
    ],
    quote: "Good questions are not a delay to the work. They are part of the work.",
    author: "TMI Community",
    initials: "TM",
    role: "Community team",
    time: "Jun 12, 2025",
    publishedAt: "2025-06-12",
    readTime: "3 min read",
    category: "Community news",
    replies: 8,
    likes: 39,
    views: 608,
    tags: ["events", "office-hours", "product"],
  },
  {
    slug: "designing-for-the-second-user",
    title: "Designing for the second user, not only the first",
    excerpt: "The first user teaches you whether a workflow is possible. The second user reveals whether it is understandable, transferable, and ready to become a system.",
    body: [
      "Early product work rewards speed and proximity. You know the user, you know the workaround, and the interface can borrow context from the conversation around it. That advantage disappears as soon as another person inherits the workflow.",
      "We began documenting the handoffs that felt obvious: what a status means, why a decision was made, and where the next person should look. Those small explanations became more valuable than another round of visual polish.",
      "Designing for the second user is not about removing personality. It is about giving the work enough structure to travel without losing its intent.",
    ],
    quote: "A useful interface does not only help someone begin. It helps someone continue.",
    author: "Sara Ahmed",
    initials: "SA",
    role: "Design technologist",
    time: "Feb 21, 2024",
    publishedAt: "2024-02-21",
    readTime: "5 min read",
    category: "Career & craft",
    replies: 19,
    likes: 72,
    views: 1031,
    tags: ["design", "systems", "handoffs"],
  },
  {
    slug: "the-maintenance-budget",
    title: "The maintenance budget is part of the product",
    excerpt: "A practical argument for planning the work that keeps a product trustworthy: dependency upgrades, documentation, observability, and the small repairs users never see.",
    body: [
      "Maintenance is easy to postpone because its success looks like nothing happened. The queue stays quiet, the dependency update does not make a headline, and the runbook only matters at the exact moment nobody wants to write one.",
      "In 2023, we started reserving a visible slice of every planning cycle for maintenance. The result was not a perfect backlog. It was a team that could explain the cost of keeping the product dependable before the cost became urgent.",
      "Trust is built from the parts of the product that are boring to discuss and expensive to ignore. Give those parts a budget, an owner, and a place in the roadmap.",
    ],
    quote: "Reliability is a product capability, not a housekeeping task.",
    author: "Leo Martins",
    initials: "LM",
    role: "Cloud architect",
    time: "Sep 06, 2023",
    publishedAt: "2023-09-06",
    readTime: "4 min read",
    category: "Build in public",
    replies: 14,
    likes: 58,
    views: 882,
    tags: ["reliability", "operations", "craft"],
    solved: true,
  },
];

export const communityMembers: CommunityMember[] = [
  { name: "Ayesha Khan", initials: "AK", role: "Product engineer", location: "Lahore, PK", specialty: "Secure AI systems", contribution: "18 conversations", accent: "#1c69d4", bio: "Builds product workflows that make security visible early, practical in delivery, and useful after launch.", joined: "Joined Mar 2023" },
  { name: "Omar Farooq", initials: "OF", role: "Indie maker", location: "Dubai, UAE", specialty: "Product systems", contribution: "12 conversations", accent: "#e22718", bio: "Documents the operating habits, trade-offs, and quiet experiments behind small software businesses.", joined: "Joined Jul 2023" },
  { name: "Mina Patel", initials: "MP", role: "Staff engineer", location: "London, UK", specialty: "Platform architecture", contribution: "27 conversations", accent: "#0066b1", bio: "Helps teams choose durable foundations for products that are still discovering what they need to become.", joined: "Joined Nov 2022" },
  { name: "Daniel Wu", initials: "DW", role: "Security lead", location: "Toronto, CA", specialty: "Application security", contribution: "9 conversations", accent: "#1c69d4", bio: "Turns security programs into clear ownership, useful habits, and conversations teams can keep having.", joined: "Joined Aug 2024" },
  { name: "Sara Ahmed", initials: "SA", role: "Design technologist", location: "Karachi, PK", specialty: "Human-centred systems", contribution: "14 conversations", accent: "#e22718", bio: "Explores the space where interface decisions, organizational memory, and real human handoffs meet.", joined: "Joined Feb 2023" },
  { name: "Leo Martins", initials: "LM", role: "Cloud architect", location: "Lisbon, PT", specialty: "Reliable infrastructure", contribution: "21 conversations", accent: "#0066b1", bio: "Shares practical patterns for making infrastructure understandable, observable, and ready for the next operator.", joined: "Joined Sep 2023" },
];

export const communityStats = [
  { value: "4.8k", label: "members building" },
  { value: "248", label: "conversations" },
  { value: "36", label: "countries represented" },
];

export const communityGuidelines = [
  { number: "01", title: "Make it useful", body: "Share the context behind a decision, the constraint you faced, and the learning that can help someone else take a clearer next step." },
  { number: "02", title: "Assume good intent", body: "Disagree with the idea, not the person. Ask before you infer, name your uncertainty, and leave room for a different lived experience." },
  { number: "03", title: "Protect the room", body: "Keep private data, credentials, customer details, and confidential client information out of posts, screenshots, and replies." },
  { number: "04", title: "Keep the signal high", body: "Avoid empty promotion, copied content, and engagement bait. If you share a project, tell us what you learned while building it." },
  { number: "05", title: "Credit the work", body: "Link to the people, teams, research, and open-source projects that shaped your thinking. Good references make a conversation more durable." },
  { number: "06", title: "Leave the door open", body: "Write for the person who arrives later. Use descriptive titles, explain the acronyms, and close the loop when a question is resolved." },
];

export function getCommunityPost(slug: string) {
  return communityPosts.find((post) => post.slug === slug);
}
