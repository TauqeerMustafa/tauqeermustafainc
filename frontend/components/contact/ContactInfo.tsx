import { Mail, Phone, MapPin, Clock } from "lucide-react";

import { company } from "@/data/company";
import { IconFrame } from "@/components/home/ui";

const items = [
  { label: "Email", value: company.email, icon: Mail, href: `mailto:${company.email}` },
  { label: "Phone", value: company.phone, icon: Phone, href: `tel:${company.phone.replace(/\s+/g, "")}` },
  { label: "Office", value: company.headquarters, icon: MapPin },
  { label: "Working Hours", value: company.workingHours, icon: Clock },
];

export default function ContactInfo() {
  return (
    <div className="rounded-none border border-[#D7DEE8] bg-white p-6 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_18px_48px_rgba(17,24,39,0.05)] sm:p-8">
      <h2 className="text-xl font-semibold text-[#0A1628]">Contact Information</h2>
      <p className="mt-3 text-sm leading-6 text-[#6B7280]">
        Reach out directly, or send a message and a member of the team will follow up within one business day.
      </p>

      <div className="mt-8 space-y-6">
        {items.map((item) => (
          <div key={item.label} className="flex gap-4">
            <IconFrame icon={item.icon} />
            <div>
              <h3 className="text-sm font-semibold text-[#0A1628]">{item.label}</h3>
              {item.href ? (
                <a href={item.href} className="text-sm text-[#6B7280] transition hover:text-[#0A46A8]">
                  {item.value}
                </a>
              ) : (
                <p className="text-sm text-[#6B7280]">{item.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
