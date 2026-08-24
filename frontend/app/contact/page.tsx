import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";
import OfficeMap from "@/components/contact/OfficeMap";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#050816] px-6 py-20">
      <div className="mx-auto max-w-7xl">

        <div className="mb-16 text-center">
          <h1 className="text-5xl font-bold text-white">
            Contact Us
          </h1>

          <p className="mt-4 text-slate-400">
            Tell us about your project and we'll get back to you.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <ContactForm />
          <ContactInfo />
        </div>

        <div className="mt-16">
          <OfficeMap />
        </div>

      </div>
    </main>
  );
}
