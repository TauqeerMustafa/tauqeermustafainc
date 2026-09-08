import type { Metadata } from 'next';
import DocsLayoutClient from './DocsLayoutClient';

export const metadata: Metadata = {
  title: {
    template: '%s | TMI Documentation & Policies',
    default: 'Documentation & Legal Policies | Tauqeer Mustafa Inc.',
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
  return <DocsLayoutClient>{children}</DocsLayoutClient>;
}
