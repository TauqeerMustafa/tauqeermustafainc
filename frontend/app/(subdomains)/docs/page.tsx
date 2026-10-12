import type { Metadata } from 'next';
import DocsHubClient from './DocsHubClient';

export const metadata: Metadata = {
  title: 'Documentation & Legal Policies | Qorlune LLC',
  description:
    'Official corporate documentation, legal agreements, compliance standards, and operating playbooks.',
};

export default function DocsPage() {
  return <DocsHubClient />;
}
