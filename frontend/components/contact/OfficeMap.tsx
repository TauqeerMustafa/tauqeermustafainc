import { company } from "@/data/company";

export default function OfficeMap() {
  const office = company.offices[0];
  return (
    <section className="overflow-hidden rounded-none border border-white/10 bg-white/5 backdrop-blur-xl">

      <div className="border-b border-white/10 p-8">
        <h2 className="text-3xl font-bold text-white">
          Visit Our Office
        </h2>

        <p className="mt-3 text-slate-400">
          {office.address}
        </p>
      </div>

      <iframe
        title={`${company.name} — ${office.label}`}
        src={office.mapEmbedUrl}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        className="h-[450px] w-full border-0"
      />

    </section>
  );
}
