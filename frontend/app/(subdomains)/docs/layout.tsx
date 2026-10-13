import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Qorlune Documentation & Policies',
    default: 'Documentation & Legal Policies | Qorlune LLC',
  },
  description:
    'Official corporate documentation, legal agreements, compliance standards, and operating playbooks.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-canvas text-ink">{children}</div>;
}

