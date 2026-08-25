/**
 * Button message templates for WhatsApp
 * These use Meta's interactive button format (up to 3 buttons)
 */

export const BUTTON_TEMPLATES = [
  {
    name: "welcome_buttons",
    header: "👋 Welcome to Tauqeer Mustafa Inc",
    body: "Thank you for reaching out! We're excited to help bring your ideas to life.\n\nHow can we assist you today?",
    footer: "We typically respond within 2-4 hours",
    buttons: ["View Services", "Get Pricing", "Contact Us"],
  },
  {
    name: "services_buttons",
    header: "🚀 Our Services",
    body: "We specialize in:\n\n✓ Web Development - Custom websites & apps\n✓ Mobile Apps - iOS & Android\n✓ UI/UX Design - Beautiful interfaces\n✓ E-commerce - Online stores\n✓ API Development - Backend systems",
    footer: "Trusted by 100+ clients worldwide",
    buttons: ["Get Quote", "View Portfolio", "Ask Question"],
  },
  {
    name: "pricing_buttons",
    header: "💰 Our Pricing",
    body: "Every project is unique! Our rates:\n\n📱 Mobile Apps - From $5,000\n🌐 Websites - From $2,000\n🎨 Design - From $1,000\n⚡ Hourly - $50-150/hr\n\nShare your requirements for a detailed quote within 24 hours.",
    footer: "All quotes are free & no obligation",
    buttons: ["Request Quote", "View Services", "Schedule Call"],
  },
  {
    name: "quote_ready_buttons",
    header: "✅ Your Quote is Ready!",
    body: "Thank you for your patience!\n\nWe've prepared a detailed proposal including:\n• Project scope & timeline\n• Pricing breakdown\n• Our approach & methodology\n• Next steps",
    footer: "Quote valid for 30 days",
    buttons: ["View Quote", "Ask Questions", "Accept Quote"],
  },
  {
    name: "project_kickoff_buttons",
    header: "🎉 Welcome Aboard!",
    body: "We're thrilled to start your project!\n\nYou'll receive:\n✓ Dedicated project manager\n✓ Access to project portal\n✓ Weekly progress updates\n✓ Direct communication channel",
    footer: "Let's build something amazing together!",
    buttons: ["View Portal", "Meet Team", "Ask Question"],
  },
  {
    name: "milestone_ready_buttons",
    header: "✨ Milestone Complete!",
    body: "Great news! We've completed the current milestone for your project.\n\nPlease review the deliverables and share your feedback. Revisions are included!",
    footer: "We aim to respond within 24 hours",
    buttons: ["View Work", "Approve", "Request Changes"],
  },
  {
    name: "payment_due_buttons",
    header: "💳 Payment Reminder",
    body: "This is a friendly reminder about your upcoming payment.\n\nAmount Due: [AMOUNT]\nDue Date: [DATE]\n\nOnce confirmed, we'll proceed with the next phase!",
    footer: "Multiple payment options available",
    buttons: ["Pay Now", "View Invoice", "Need Help"],
  },
  {
    name: "support_buttons",
    header: "🎫 How Can We Help?",
    body: "We're here to support you!\n\nWhether it's a bug, feature request, or general question - we've got you covered.\n\nTypical response times:\n• High Priority: 2-4 hours\n• Medium: 24 hours\n• Low: 48 hours",
    footer: "Available Mon-Sat, 9am-6pm PKT",
    buttons: ["Report Issue", "Ask Question", "Request Feature"],
  },
  {
    name: "feedback_buttons",
    header: "💙 We Value Your Feedback",
    body: "Your project is complete!\n\nWe'd love to hear about your experience. Your feedback helps us serve you better and improve our services.",
    footer: "Thank you for choosing us!",
    buttons: ["Leave Review", "Report Issue", "New Project"],
  },
  {
    name: "consultation_buttons",
    header: "📞 Free Consultation",
    body: "Not sure where to start?\n\nBook a FREE 30-minute consultation call!\n\nWe'll discuss:\n✓ Your vision & goals\n✓ Technical approach\n✓ Budget & timeline\n✓ Our process",
    footer: "No obligation, just helpful advice",
    buttons: ["Book Call", "Chat Here", "View Calendar"],
  },
];
