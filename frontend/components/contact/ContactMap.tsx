import { company } from "@/data/company";

export default function ContactMap() {
  return (
    <div className="flex flex-col gap-4">
      {company.offices.map((office) => (
        <div
          key={office.label}
          className="overflow-hidden border border-line bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04),0_18px_48px_rgba(17,24,39,0.05)]"
        >
          <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-3">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-action">
              {office.label}
            </p>
            <p className="truncate text-[12px] text-ink-muted">{office.address}</p>
          </div>
          <iframe
            src={office.mapEmbedUrl}
            title={`${company.name} — ${office.label} on Google Maps`}
            width="100%"
            height="300"
            style={{ border: 0, display: "block" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      ))}
    </div>
  );
}
