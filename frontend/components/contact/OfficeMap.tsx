export default function OfficeMap() {
  return (
    <section className="overflow-hidden rounded-none border border-white/10 bg-white/5 backdrop-blur-xl">

      <div className="border-b border-white/10 p-8">
        <h2 className="text-3xl font-bold text-white">
          Visit Our Office
        </h2>

        <p className="mt-3 text-slate-400">
          We work with clients worldwide while operating from Pakistan.
        </p>
      </div>

      <iframe
        title="Office Location"
        src="https://www.google.com/maps?q=Islamabad,Pakistan&output=embed"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        className="h-[450px] w-full border-0"
      />

    </section>
  );
}
