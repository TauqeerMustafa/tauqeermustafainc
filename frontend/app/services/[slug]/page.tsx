import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import {
  Card,
  PageHero,
  PrimaryButton,
  Section,
  SectionHeader,
} from "@/components/home/ui";
import { services } from "@/lib/site-data";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);

  if (!service) {
    notFound();
  }

  return (
    <>
      <PageHero
        eyebrow="Service"
        title={service.title}
        description={service.description}
      >
        <PrimaryButton href="/contact">Discuss This Service</PrimaryButton>
      </PageHero>

      <Section className="bg-[#F8FAFC]" labelledBy="service-outcomes">
        <SectionHeader
          id="service-outcomes"
          eyebrow="Outcomes"
          title="What this engagement can include"
        />
        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {service.outcomes.map((outcome) => (
            <Card key={outcome} className="hover:translate-y-0">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#C9A227]" aria-hidden />
                <p className="font-medium text-[#374151]">{outcome}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
