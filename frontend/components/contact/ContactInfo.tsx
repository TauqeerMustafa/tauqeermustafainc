import { Mail, Phone, MapPin, Clock, ArrowUpRight } from "lucide-react";

import { company } from "@/data/company";

/* ── Hybrid design: BMW M dark card + Apple blue links ── */

const items = [
  {
    label: "Email",
    value: company.email,
    icon: Mail,
    href: `mailto:${company.email}`,
  },
  {
    label: "Phone",
    value: company.phone,
    icon: Phone,
    href: `tel:${company.phone.replace(/\s+/g, "")}`,
  },
  {
    label: "Location",
    value: company.city,
    icon: MapPin,
    href: undefined,
  },
  {
    label: "Working Hours",
    value: company.workingHours,
    icon: Clock,
    href: undefined,
  },
];

export default function ContactInfo() {
  return (
    <div className="rounded-[18px] bg-[#1a2129] px-8 py-9 text-white">
      {/* Header */}
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2997ff]">
        Reach us directly
      </p>
      <p className="mt-4 max-w-xs text-[15px] leading-[1.5] tracking-[-0.2px] text-[#bbbbbb]">
        Prefer not to fill out a form? We respond to direct messages within one business day.
      </p>

      {/* M-stripe divider */}
      <div className="mt-7 flex h-[3px] w-16 overflow-hidden rounded-full">
        <span className="flex-1 bg-[#0066b1]" />
        <span className="flex-1 bg-[#1c69d4]" />
        <span className="flex-1 bg-[#e22718]" />
      </div>

      {/* Contact items */}
      <ul className="mt-8 space-y-6">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label} className="flex items-start gap-4">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/8">
                <Icon className="h-4 w-4 text-[#2997ff]" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6e6e73]">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="mt-1 flex items-center gap-1 text-[15px] font-[400] leading-[1.4] tracking-[-0.2px] text-white transition hover:text-[#2997ff]"
                  >
                    {item.value}
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
                  </a>
                ) : (
                  <p className="mt-1 text-[15px] font-[400] leading-[1.4] tracking-[-0.2px] text-[#bbbbbb]">
                    {item.value}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Social row */}
      {company.social?.linkedin && (
        <div className="mt-8 border-t border-white/10 pt-7">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6e6e73]">
            Connect
          </p>
          <a
            href={company.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-[14px] font-semibold text-[#2997ff] transition hover:opacity-75"
          >
            LinkedIn
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      )}
    </div>
  );
}
