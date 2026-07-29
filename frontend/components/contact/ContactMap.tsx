import { company } from "@/data/company";

export default function ContactMap() {
  return (
    <div className="overflow-hidden border border-[#D7DEE8] bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04),0_18px_48px_rgba(17,24,39,0.05)]">
      <iframe
        src={company.mapEmbedUrl}
        title={`${company.name} location on Google Maps`}
        width="100%"
        height="380"
        style={{ border: 0, display: "block" }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
