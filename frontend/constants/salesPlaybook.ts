/**
 * B2B Sales Command Center — 45-Day Strategy & Outreach Data Engine.
 *
 * Aligned with Tauqeer Mustafa Inc.'s service offerings:
 *  1. Cybersecurity Consulting
 *  2. Financial Compliance
 *  3. SEO & AdSense Optimization
 */

export type SalesPhaseId = "foundation" | "outreach" | "pipeline" | "closing" | "scale";

export interface SalesPhase {
  id: SalesPhaseId;
  name: string;
  daysRange: string;
  startDay: number;
  endDay: number;
  summary: string;
  colorTone: "blue" | "green" | "amber" | "neutral" | "red";
}

export const SALES_PHASES: SalesPhase[] = [
  {
    id: "foundation",
    name: "Foundation & Setup",
    daysRange: "Days 1–9",
    startDay: 1,
    endDay: 9,
    summary: "ICP definition, buyer persona mapping, lead list architecture, and messaging setup.",
    colorTone: "blue",
  },
  {
    id: "outreach",
    name: "Cold Outreach Sprint",
    daysRange: "Days 10–16",
    startDay: 10,
    endDay: 16,
    summary: "High-cadence multi-touch outreach across LinkedIn, Cold Email, and Cold Calling.",
    colorTone: "amber",
  },
  {
    id: "pipeline",
    name: "Pipeline Building & Demos",
    daysRange: "Days 17–24",
    startDay: 17,
    endDay: 24,
    summary: "Conducting discovery calls, qualifying BANT criteria, and locking in proposal scopes.",
    colorTone: "blue",
  },
  {
    id: "closing",
    name: "Objections & Closing",
    daysRange: "Days 25–35",
    startDay: 25,
    endDay: 35,
    summary: "Overcoming commercial objections, contract negotiations, and deal execution.",
    colorTone: "green",
  },
  {
    id: "scale",
    name: "Retention, Referrals & Scale",
    daysRange: "Days 36–45",
    startDay: 36,
    endDay: 45,
    summary: "Seamless delivery handover, referral generation loops, and pipeline velocity review.",
    colorTone: "neutral",
  },
];

export interface PlaybookDayTask {
  day: number;
  phase: SalesPhaseId;
  title: string;
  description: string;
  actionItem: string;
  targetCount?: string;
  priority: "high" | "medium" | "low";
}

export const PLAYBOOK_45_DAYS: PlaybookDayTask[] = [
  // ── Phase 1: Foundation & Setup (Days 1–9) ──
  {
    day: 1,
    phase: "foundation",
    title: "Service Line Mastery & ICP Definition",
    description: "Deep dive into TMI's 3 core offerings: Cybersecurity consulting, Financial compliance, and SEO/AdSense optimization. Document specific pain points for each industry.",
    actionItem: "Define ICP criteria (revenue $1M–$20M, employee count 10–100, designated decision maker).",
    targetCount: "3 ICP Profiles",
    priority: "high",
  },
  {
    day: 2,
    phase: "foundation",
    title: "Identify 30 Primary Target Accounts",
    description: "Research target companies across Fintech, E-commerce, and SaaS sectors. Verify tech stack, executive leadership, and potential vulnerability indicators.",
    actionItem: "Add 30 verified company profiles with verified contact details into CRM.",
    targetCount: "30 Accounts",
    priority: "high",
  },
  {
    day: 3,
    phase: "foundation",
    title: "Decision Maker Mapping & Org Charting",
    description: "Identify key economic buyers: CTO/CISO for Cybersecurity, CFO/Head of Finance for Compliance, CMO/Head of Growth for SEO.",
    actionItem: "Map at least 2 contact stakeholders (primary + influencer) for each target account.",
    targetCount: "60 Contacts",
    priority: "medium",
  },
  {
    day: 4,
    phase: "foundation",
    title: "Outreach Copy Personalization & Proof Points",
    description: "Tailor email frameworks with industry-specific case studies, metric proof points (e.g. 40% organic traffic gain, ISO compliance fast-track).",
    actionItem: "Prepare 3 personalized opening lines per service line in the templates workbench.",
    targetCount: "3 Sets of Copy",
    priority: "medium",
  },
  {
    day: 5,
    phase: "foundation",
    title: "Email Deliverability & Domain Health Audit",
    description: "Verify SPF, DKIM, DMARC records for outreach domains. Test spam score on mail-tester to ensure 9.5+/10 deliverability rating.",
    actionItem: "Run domain warmup and confirm zero spam flags.",
    targetCount: "100% In-box Score",
    priority: "high",
  },
  {
    day: 6,
    phase: "foundation",
    title: "LinkedIn Profile Optimization & Social Presence",
    description: "Optimize LinkedIn headline, summary, and featured section as a high-authority B2B advisor rather than an aggressive salesperson.",
    actionItem: "Revamp headline to: 'Helping B2B Founders Scale with Secure Systems & Predictable Traffic'.",
    targetCount: "Profile Audit Complete",
    priority: "medium",
  },
  {
    day: 7,
    phase: "foundation",
    title: "Lead Intake & Data Integrity in CRM",
    description: "Ensure all 30 accounts have assigned status 'new', complete emails, phone numbers, and mandatory next follow-up dates.",
    actionItem: "Zero missing fields in CRM lead table.",
    targetCount: "30 Clean Records",
    priority: "high",
  },
  {
    day: 8,
    phase: "foundation",
    title: "Cold Calling Script & Objection Rehearsal",
    description: "Practice the 30-second Cold Calling pitch and objection responses with a peer. Focus on tonality, calm pacing, and problem curiosity.",
    actionItem: "Conduct 3 practice mock pitches with objection pivots.",
    targetCount: "3 Rehearsals",
    priority: "medium",
  },
  {
    day: 9,
    phase: "foundation",
    title: "Phase 1 Review & Week 2 Outreach Preparation",
    description: "Review all account research, copy assets, and queue up Monday morning multi-channel outreach schedules.",
    actionItem: "Final sign-off on 40 verified leads ready for first touch.",
    targetCount: "40 Ready Leads",
    priority: "high",
  },

  // ── Phase 2: Cold Outreach Sprint (Days 10–16) ──
  {
    day: 10,
    phase: "outreach",
    title: "Launch Batch 1: Cold Email & LinkedIn Touch",
    description: "Send initial personalized cold emails to 20 target accounts. Send 20 customized LinkedIn connection requests with blank/soft intro.",
    actionItem: "Log touches in CRM immediately and advance lead status to 'contacted'.",
    targetCount: "20 Emails + 20 DMs",
    priority: "high",
  },
  {
    day: 11,
    phase: "outreach",
    title: "Launch Batch 2 & First Cold Call Block",
    description: "Send 20 more emails to Batch 2. Execute 15 cold calls to initial Batch 1 prospects to confirm receipt of executive audit snippet.",
    actionItem: "Log call outcomes, voicemails, and gatekeeper notes in lead timeline.",
    targetCount: "20 Emails + 15 Calls",
    priority: "high",
  },
  {
    day: 12,
    phase: "outreach",
    title: "Multi-Touch Step 2: Value Asset Follow-Up",
    description: "For prospects who opened but haven't replied, deliver a targeted value asset (e.g. 1-page Security Checklist or SEO Quick-Win Sheet).",
    actionItem: "Send 25 follow-up emails referencing previous note with zero guilt-tripping.",
    targetCount: "25 Follow-ups",
    priority: "medium",
  },
  {
    day: 13,
    phase: "outreach",
    title: "Power Calling Hour: Afternoon Outreach",
    description: "Target decision makers during the golden hour (3:30 PM – 5:30 PM local time). Focus on asking for their perspective on recent compliance shifts.",
    actionItem: "25 cold calls completed with minimum 5 live executive conversations.",
    targetCount: "25 Calls",
    priority: "high",
  },
  {
    day: 14,
    phase: "outreach",
    title: "LinkedIn Engagement & Content Interaction",
    description: "Engage with recent posts by your 40 target prospects. Leave high-value comments demonstrating technical subject-matter expertise.",
    actionItem: "Comment thoughtfully on 15 prospect posts.",
    targetCount: "15 Engagements",
    priority: "low",
  },
  {
    day: 15,
    phase: "outreach",
    title: "Follow-Up Cadence #3: The Social Proof Angle",
    description: "Send case study email highlighting specific ROI achieved for a client in a similar vertical.",
    actionItem: "Send 30 tailored case study touches via email or LinkedIn InMail.",
    targetCount: "30 Touches",
    priority: "medium",
  },
  {
    day: 16,
    phase: "outreach",
    title: "Phase 2 Close: Clear Follow-ups & Scorecard Update",
    description: "Clear all due follow-ups in CRM. Review email open and reply rates. Log metrics into weekly performance scorecard.",
    actionItem: "Ensure zero follow-ups overdue in CRM.",
    targetCount: "100% Cleared",
    priority: "high",
  },

  // ── Phase 3: Pipeline Building & Demos (Days 17–24) ──
  {
    day: 17,
    phase: "pipeline",
    title: "Discovery Call Preparation & BANT Matrix",
    description: "Pre-brief for upcoming discovery calls. Research the prospect's latest hiring postings, news releases, and website infrastructure.",
    actionItem: "Prepare custom discovery agenda for 3 booked calls.",
    targetCount: "3 Pre-briefs",
    priority: "high",
  },
  {
    day: 18,
    phase: "pipeline",
    title: "Conduct Discovery Calls #1 & #2",
    description: "Execute 30-minute discovery calls. Focus on listening 70% of the time. Uncover latent risks in security posture or SEO loss.",
    actionItem: "Move leads from 'contacted' to 'qualified' upon confirming pain and timeline.",
    targetCount: "2 Discovery Calls",
    priority: "high",
  },
  {
    day: 19,
    phase: "pipeline",
    title: "Nurture Cold Accounts: Sourcing Batch 3",
    description: "Replenish top-of-funnel by adding 20 new high-conviction leads to prevent pipeline drought in weeks 4 and 5.",
    actionItem: "Intake 20 new leads with assigned next follow-up dates.",
    targetCount: "20 New Leads",
    priority: "medium",
  },
  {
    day: 20,
    phase: "pipeline",
    title: "Conduct Discovery Call #3 & Stakeholder Alignment",
    description: "Run discovery call with secondary executive stakeholder. Confirm procurement process and who signs off on consulting contracts.",
    actionItem: "Log stakeholder notes in CRM lead timeline.",
    targetCount: "1 Discovery Call",
    priority: "high",
  },
  {
    day: 21,
    phase: "pipeline",
    title: "Post-Discovery Value Recap Delivery",
    description: "Send 9-point recap email within 4 hours of discovery call detailing prospect's exact words, agreed problems, and scheduled demo date.",
    actionItem: "Send recap emails with calendar invites attached.",
    targetCount: "100% Fast Recap",
    priority: "high",
  },
  {
    day: 22,
    phase: "pipeline",
    title: "Second-Touch Sprint for Non-Responsive Accounts",
    description: "Call through leads who engaged with LinkedIn touches but missed email replies. Use pattern interrupt script.",
    actionItem: "20 follow-up calls logged in CRM.",
    targetCount: "20 Calls",
    priority: "medium",
  },
  {
    day: 23,
    phase: "pipeline",
    title: "Proposal Scope Architecting",
    description: "Structure modular proposals: Phase 1 Immediate Remediation / Quick Wins; Phase 2 Long-term Consulting retainer.",
    actionItem: "Draft 2 customized commercial proposals.",
    targetCount: "2 Proposals",
    priority: "high",
  },
  {
    day: 24,
    phase: "pipeline",
    title: "Phase 3 Funnel Health Check",
    description: "Audit pipeline velocity: check time in stage, qualification accuracy, and follow-up compliance.",
    actionItem: "Ensure minimum 5 deals currently in 'qualified' stage.",
    targetCount: "5 Qualified Deals",
    priority: "high",
  },

  // ── Phase 4: Objections & Closing (Days 25–35) ──
  {
    day: 25,
    phase: "closing",
    title: "Deliver Proposal Presentation #1",
    description: "Walk the decision-maker through proposal live on video call. Never email a proposal cold without a walk-through.",
    actionItem: "Move lead status to 'proposal_sent' with follow-up set for 48 hours.",
    targetCount: "1 Live Proposal",
    priority: "high",
  },
  {
    day: 26,
    phase: "closing",
    title: "Commercial Objection Handling: Budget Constraints",
    description: "Address 'we don't have budget right now' by calculating the daily cost of downtime, non-compliance fines, or lost organic rank.",
    actionItem: "Send tailored ROI comparison sheet.",
    targetCount: "ROI Model Delivered",
    priority: "high",
  },
  {
    day: 27,
    phase: "closing",
    title: "Deliver Proposal Presentation #2",
    description: "Second live proposal walkthrough with CFO / VP Engineering. Address payment terms and service level agreements (SLAs).",
    actionItem: "Log timeline notes and schedule decision date.",
    targetCount: "1 Live Proposal",
    priority: "high",
  },
  {
    day: 28,
    phase: "closing",
    title: "Handling Vendor Competition & Incumbent Loyalty",
    description: "Handle 'we already have a vendor' by offering a non-intrusive second-opinion audit or niche project scope.",
    actionItem: "Re-engage 3 stalled deals with secondary audit offer.",
    targetCount: "3 Re-engagements",
    priority: "medium",
  },
  {
    day: 29,
    phase: "closing",
    title: "Follow-Up on Proposal #1: Closing Discussion",
    description: "Call decision maker on scheduled follow-up date. Review redlines, onboarding timeline, and execute verbal agreement.",
    actionItem: "Achieve verbal commitment on deal terms.",
    targetCount: "1 Verbal Agreement",
    priority: "high",
  },
  {
    day: 30,
    phase: "closing",
    title: "Contract Generation & Legal Review",
    description: "Issue formal engagement agreement, Statement of Work (SOW), and payment links / invoice schedule.",
    actionItem: "Send final agreement via DocuSign / digital signature portal.",
    targetCount: "1 SOW Sent",
    priority: "high",
  },
  {
    day: 31,
    phase: "closing",
    title: "Closing Touch for Proposal #2",
    description: "Follow up with procurement team on Proposal #2. Address compliance verification questions and insurance certs.",
    actionItem: "Clear procurement checklist items.",
    targetCount: "Procurement Cleared",
    priority: "medium",
  },
  {
    day: 32,
    phase: "closing",
    title: "Lock In First Deal Won",
    description: "Receive countersigned agreement and initial retainer payment. Move lead status to 'won' in CRM.",
    actionItem: "Celebrate win and mark status 'won' with realized deal value.",
    targetCount: "1 Won Deal",
    priority: "high",
  },
  {
    day: 33,
    phase: "closing",
    title: "Breakup Email Sequence for Stalled Deals",
    description: "Send polite breakup email to leads silent for 10+ days. This paradoxically generates a 25% response rate.",
    actionItem: "Send 10 breakup emails to stalled prospects.",
    targetCount: "10 Breakup Emails",
    priority: "medium",
  },
  {
    day: 34,
    phase: "closing",
    title: "Final Closing Push for Proposal #2",
    description: "Review outstanding questions and secure signature on Proposal #2.",
    actionItem: "Move second deal to 'won' upon contract execution.",
    targetCount: "1 Won Deal",
    priority: "high",
  },
  {
    day: 35,
    phase: "closing",
    title: "Phase 4 Review & Revenue Realization",
    description: "Calculate total pipeline converted, revenue booked, and evaluate win/loss reasons in CRM.",
    actionItem: "Log won deal values and complete pipeline retrospective.",
    targetCount: "Scorecard Updated",
    priority: "high",
  },

  // ── Phase 5: Retention, Referrals & Scale (Days 36–45) ──
  {
    day: 36,
    phase: "scale",
    title: "Client Onboarding Handover to Delivery Team",
    description: "Facilitate smooth kickoff meeting with internal technical delivery leads and client stakeholders.",
    actionItem: "Complete client onboarding brief and shared folder setup.",
    targetCount: "1 Onboarding Complete",
    priority: "high",
  },
  {
    day: 37,
    phase: "scale",
    title: "Day-7 Client Check-in & First Value Delivery",
    description: "Verify that client has received initial technical deliverable (e.g. vulnerability report or SEO audit).",
    actionItem: "Confirm client executive satisfaction with kickoff.",
    targetCount: "1 Check-in Call",
    priority: "medium",
  },
  {
    day: 38,
    phase: "scale",
    title: "Systematic Referral Request Protocol",
    description: "Ask newly delighted clients for 2 peer introductions in non-competing industries.",
    actionItem: "Receive at least 1 warm referral introduction.",
    targetCount: "1 Warm Referral",
    priority: "high",
  },
  {
    day: 39,
    phase: "scale",
    title: "SOP Standardization for High-Performing Scripts",
    description: "Document which email hooks and calling angles produced the highest conversion rates over the 45 days.",
    actionItem: "Update team playbook with top 3 performing templates.",
    targetCount: "SOP Documented",
    priority: "medium",
  },
  {
    day: 40,
    phase: "scale",
    title: "Re-engage 'Lost - Timing' Leads",
    description: "Check in on prospects marked 'lost' in Week 2 or 3 due to timing or fiscal quarter constraints.",
    actionItem: "Send 15 gentle check-in messages.",
    targetCount: "15 Re-engagements",
    priority: "medium",
  },
  {
    day: 41,
    phase: "scale",
    title: "Case Study & Social Proof Asset Creation",
    description: "Draft 1-page anonymized success story showcasing metrics achieved with the first closed engagement.",
    actionItem: "Publish case study snippet to company knowledge base.",
    targetCount: "1 Case Study",
    priority: "low",
  },
  {
    day: 42,
    phase: "scale",
    title: "Upsell & Scope Expansion Planning",
    description: "Identify expansion opportunities on won accounts (e.g. adding compliance monitoring to an SEO contract).",
    actionItem: "Prepare expansion scope for existing accounts.",
    targetCount: "1 Expansion Roadmap",
    priority: "medium",
  },
  {
    day: 43,
    phase: "scale",
    title: "45-Day Conversion Velocity Audit",
    description: "Analyze metrics from Day 1 to Day 45: First touch to meeting rate, meeting to proposal rate, proposal to close rate.",
    actionItem: "Calculate end-to-end unit economics and sales cycle length.",
    targetCount: "Audit Complete",
    priority: "high",
  },
  {
    day: 44,
    phase: "scale",
    title: "Team Knowledge Transfer & Masterclass",
    description: "Present insights, best practices, and objection tactics to broader revenue team during weekly huddle.",
    actionItem: "Host 30-minute debrief presentation.",
    targetCount: "Debrief Delivered",
    priority: "medium",
  },
  {
    day: 45,
    phase: "scale",
    title: "Next 45-Day Growth Architecture Sign-Off",
    description: "Finalize target accounts, quota targets, and channel allocations for the upcoming quarter.",
    actionItem: "Sign off on Quarter-Ahead Sales Master Plan.",
    targetCount: "Master Plan Signed",
    priority: "high",
  },
];

export interface OutreachTemplate {
  id: string;
  category: "email" | "linkedin" | "phone" | "objection";
  name: string;
  subject?: string;
  body: string;
  context: string;
  tags: string[];
}

export const DEFAULT_TEMPLATES: OutreachTemplate[] = [
  // ── Cold Emails ──
  {
    id: "email_pain_point",
    category: "email",
    name: "Pain-Point & Risk Audit Hook",
    subject: "Quick question regarding {{company}}'s {{service_area}} posture",
    body: `Hi {{first_name}},

Noticed {{company}} has been expanding its operations recently — congratulations on the momentum.

Typically when companies in {{industry}} scale at this pace, their {{service_area}} infrastructure encounters hidden bottlenecks (specifically regulatory compliance exposures and unmonitored attack surfaces).

We recently helped a similar {{industry}} firm identify and patch 14 critical vulnerabilities in under 10 days without disrupting developer velocity.

Are you open to a brief 10-minute sanity check this Thursday at 2:30 PM to see how your current safeguards compare?

Best regards,
{{sender_name}}
Tauqeer Mustafa Inc.`,
    context: "Best sent as First Touch to CTOs, CISOs, or Heads of Engineering.",
    tags: ["Email", "First Touch", "Cybersecurity", "Compliance"],
  },
  {
    id: "email_case_study",
    category: "email",
    name: "Social Proof & ROI Case Study",
    subject: "How {{peer_company}} scaled organic pipeline by 140% in 90 days",
    body: `Hi {{first_name}},

Reaching out because {{company}} came up during our research on top performers in the {{industry}} space.

One common frustration we hear from growth leaders is spending thousands on paid acquisition while their core organic SEO & site performance leaves 40%+ high-intent traffic on the table.

We helped {{peer_company}} revamp their technical architecture and search positioning, yielding:
- +140% qualified organic demo requests in 90 days
- 38% decrease in customer acquisition costs (CAC)
- Zero ongoing ad-spend bloat

Would you be against taking a quick look at the 1-page breakdown to see if the same approach applies to {{company}}?

Best,
{{sender_name}}`,
    context: "Use for Follow-up #2 or direct outreach to CMOs and Heads of Growth.",
    tags: ["Email", "SEO", "Growth", "Case Study"],
  },
  {
    id: "email_quick_hook",
    category: "email",
    name: "Quick 2-Sentence Value Hook",
    subject: "Idea for {{company}}'s team",
    body: `Hi {{first_name}},

Ran a preliminary diagnostics check on {{company}}'s publicly exposed endpoints yesterday and spotted 2 configuration flags that could impact your upcoming compliance audits.

Happy to send over the 3-minute video walkthrough if you're interested — no pitch, just wanted to put it on your radar.

Let me know if you'd like me to send it over?

Best,
{{sender_name}}`,
    context: "Extremely high response rate (30%+). Delivers immediate unasked value.",
    tags: ["Email", "Short Hook", "High Reply Rate"],
  },
  {
    id: "email_breakup",
    category: "email",
    name: "Respectful Breakup & Final Touch",
    subject: "Permission to close your file, {{first_name}}?",
    body: `Hi {{first_name}},

I haven't heard back from you, which usually tells me one of two things:
1. {{service_area}} is not a priority for {{company}} right now.
2. You're genuinely swamped and simply haven't had a chance to reply.

If it's #1, no worries at all — I will close out your file and won't clutter your inbox further.

If it's #2, and you'd still like to review those diagnostic findings, when would be a good time next week for a 5-minute sync?

Thanks for your time,
{{sender_name}}`,
    context: "Send after 3+ unanswered touches. Sparks urgency and closure.",
    tags: ["Email", "Breakup", "Last Touch"],
  },

  // ── LinkedIn DMs ──
  {
    id: "linkedin_connection",
    category: "linkedin",
    name: "Connection Request (Zero Pitch)",
    body: `Hi {{first_name}} — came across your profile while researching high-growth {{industry}} leaders in {{location}}. Really impressed by {{company}}'s recent product launch. Would love to connect and follow your journey here on LinkedIn!`,
    context: "Never pitch in the connection request. Keep acceptance rate above 60%.",
    tags: ["LinkedIn", "Connection", "Soft Touch"],
  },
  {
    id: "linkedin_welcome",
    category: "linkedin",
    name: "Welcome & Soft Problem Inquiry",
    body: `Thanks for connecting, {{first_name}}!

Saw that your team is actively hiring in engineering/operations. Out of curiosity, how are you currently navigating the latest {{industry_regulation}} requirements as your headcount expands?

Always curious how fellow leaders in {{industry}} are balancing compliance speed with product roadmaps.`,
    context: "Send 24-48 hours after connection is accepted. Initiates conversational dialogue.",
    tags: ["LinkedIn", "Direct Message", "Qualification"],
  },
  {
    id: "linkedin_asset_drop",
    category: "linkedin",
    name: "Value Asset Drop (No strings attached)",
    body: `Hey {{first_name}} — put together a 1-page executive checklist on 'Top 7 Security & Compliance Pitfalls for {{industry}} Scaleups' based on audits we ran this quarter.

Thought of {{company}} immediately. Thought you might find it useful: [Link to Resource]

No strings attached — hope it saves your team some headache!`,
    context: "Builds reciprocity and establishes trusted advisor authority.",
    tags: ["LinkedIn", "Value Asset", "Authority"],
  },

  // ── Cold Calling ──
  {
    id: "call_30s_pitch",
    category: "phone",
    name: "30-Second Elevator Cold Call Pitch",
    body: `"Hi {{first_name}}, this is {{sender_name}} with Tauqeer Mustafa Inc.

I know you weren't expecting my call, so I'll keep this strictly to 30 seconds. If what I say doesn't resonate, you can hang up on me — fair enough?

(Wait for acknowledgment: 'Sure / Go ahead')

We specialize in helping {{industry}} companies safeguard their data infrastructure and achieve rapid compliance sign-off without bloating internal engineering tickets.

Most founders we speak with tell us their biggest worry is an unexpected security breach or failing an enterprise vendor security audit right before closing their biggest contract.

Does that sound like something on your radar this quarter, or are your internal systems completely airtight?"`,
    context: "Pattern interrupt opener. Grants prospect control while setting high curiosity.",
    tags: ["Cold Call", "Opener", "Pattern Interrupt"],
  },
  {
    id: "call_gatekeeper",
    category: "phone",
    name: "Gatekeeper Navigation & Executive Access",
    body: `"Hi there, I was hoping you could point me in the right direction.

I'm trying to find who on {{first_name}}'s executive team is responsible for signing off on external security and compliance audits.

Is that typically handled by {{first_name}} directly, or is there an engineering director who oversees vendor assessments?"

(If asked what company you're with):
"It's {{sender_name}} with Tauqeer Mustafa Inc. It's regarding an executive briefing on upcoming compliance mandates for {{company}}."`,
    context: "Polite, authoritative, non-salesy. Treats the executive assistant as an ally.",
    tags: ["Cold Call", "Gatekeeper", "Executive Access"],
  },
  {
    id: "call_qualifying",
    category: "phone",
    name: "Core Discovery Qualifying Questions",
    body: `1. "When enterprise prospects review your security posture during vendor intake, what's usually the biggest sticking point?"
2. "How much internal engineering time gets drained each month handling manual compliance documentation?"
3. "If you could fix one bottleneck in your organic customer acquisition pipeline before next quarter, what would it be?"
4. "Who besides yourself would need to sign off if you decided to bring on external specialized expertise to solve this?"`,
    context: "Use during live discovery calls to pinpoint Budget, Authority, Need, and Timeline.",
    tags: ["Cold Call", "Discovery", "BANT"],
  },

  // ── Objection Handling ──
  {
    id: "obj_already_have_vendor",
    category: "objection",
    name: "Objection: 'We already have someone / vendor'",
    body: `"That makes total sense — a company of your calibre wouldn't be operating without coverage here.

Most of our current enterprise partners also had an existing vendor when we first connected. They typically keep us on standby as a secondary audit pair of eyes for mission-critical reviews where internal teams can't afford a single blind spot.

Would you be open to a 10-minute benchmark call just to see how our turnaround times and vulnerability detection rates compare to your current arrangement?"`,
    context: "Never disparage their existing vendor. Position as complementary second opinion.",
    tags: ["Objection", "Competition", "Incumbent"],
  },
  {
    id: "obj_send_email",
    category: "objection",
    name: "Objection: 'Just send me an email first'",
    body: `"I'd be more than happy to send an email, {{first_name}}. I want to make sure I don't send you generic marketing material that wastes your time.

So I send you something genuinely relevant: what is your single biggest priority right now regarding your {{service_area}} infrastructure over the next 90 days?"

(Once they give you 1 sentence):
"Got it. I'll send a 3-bullet summary addressing exactly that. What's the best direct email for you?"`,
    context: "Pivots the brush-off into an active discovery question.",
    tags: ["Objection", "Send Email", "Brush-off"],
  },
  {
    id: "obj_no_budget",
    category: "objection",
    name: "Objection: 'We don't have budget right now'",
    body: `"I completely understand, and to be transparent, I wasn't expecting you to have budget allocated for us today.

Right now, we're simply exploring whether there's even a fit for when your next fiscal allocation opens up. If we can show you a path where fixing {{pain_point}} actually saves 3x more than our consulting fee, would that be worth a 15-minute conversation before next quarter's budget is locked?"`,
    context: "Removes commercial pressure while reframing cost as cost-of-inaction.",
    tags: ["Objection", "Budget", "ROI"],
  },
  {
    id: "obj_call_back_later",
    category: "objection",
    name: "Objection: 'Call me back next quarter / month'",
    body: `"Happy to put a reminder in my calendar for next quarter, {{first_name}}.

Just so I have proper context when we speak then: what is scheduled to happen between now and then that will change your priorities around {{service_area}}?"

(This uncovers if it's a genuine timing issue or a polite brush-off).`,
    context: "Identifies whether timing is authentic or a polite dismissal.",
    tags: ["Objection", "Timing", "Delay"],
  },
];

export interface WeeklyScorecardEntry {
  week: number;
  label: string;
  emailsSent: number;
  linkedInDms: number;
  coldCalls: number;
  replies: number;
  meetings: number;
  proposals: number;
  dealsWon: number;
  revenue: number;
}

export const INITIAL_WEEKLY_SCORECARD: WeeklyScorecardEntry[] = [
  { week: 1, label: "Week 1 (Days 1–7)", emailsSent: 0, linkedInDms: 0, coldCalls: 0, replies: 0, meetings: 0, proposals: 0, dealsWon: 0, revenue: 0 },
  { week: 2, label: "Week 2 (Days 8–14)", emailsSent: 0, linkedInDms: 0, coldCalls: 0, replies: 0, meetings: 0, proposals: 0, dealsWon: 0, revenue: 0 },
  { week: 3, label: "Week 3 (Days 15–21)", emailsSent: 0, linkedInDms: 0, coldCalls: 0, replies: 0, meetings: 0, proposals: 0, dealsWon: 0, revenue: 0 },
  { week: 4, label: "Week 4 (Days 22–28)", emailsSent: 0, linkedInDms: 0, coldCalls: 0, replies: 0, meetings: 0, proposals: 0, dealsWon: 0, revenue: 0 },
  { week: 5, label: "Week 5 (Days 29–35)", emailsSent: 0, linkedInDms: 0, coldCalls: 0, replies: 0, meetings: 0, proposals: 0, dealsWon: 0, revenue: 0 },
  { week: 6, label: "Week 6 (Days 36–42)", emailsSent: 0, linkedInDms: 0, coldCalls: 0, replies: 0, meetings: 0, proposals: 0, dealsWon: 0, revenue: 0 },
  { week: 7, label: "Week 7 (Days 43–45)", emailsSent: 0, linkedInDms: 0, coldCalls: 0, replies: 0, meetings: 0, proposals: 0, dealsWon: 0, revenue: 0 },
];

export interface B2BSalesState {
  startDate: string; // YYYY-MM-DD
  completedDays: number[]; // e.g. [1, 2, 3]
  customTemplates: Record<string, { subject?: string; body: string }>;
  weeklyScorecard: WeeklyScorecardEntry[];
  taskNotes: Record<number, string>;
}

export const STORAGE_KEY_V1 = "b2b_sales_state_v1";

export function getDefaultSalesState(): B2BSalesState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    startDate: today,
    completedDays: [],
    customTemplates: {},
    weeklyScorecard: INITIAL_WEEKLY_SCORECARD,
    taskNotes: {},
  };
}
