import {
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

export default function ContactInfo() {
  return (
    <div className="space-y-8">

      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

        <h2 className="mb-8 text-3xl font-bold text-white">
          Contact Information
        </h2>

        <div className="space-y-6">

          <div className="flex gap-4">
            <Mail className="text-yellow-400" />
            <div>
              <h3 className="font-semibold text-white">Email</h3>
              <p className="text-slate-400">info@tauqeerinc.com</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Phone className="text-yellow-400" />
            <div>
              <h3 className="font-semibold text-white">Phone</h3>
              <p className="text-slate-400">+92 300 1234567</p>
            </div>
          </div>

          <div className="flex gap-4">
            <MapPin className="text-yellow-400" />
            <div>
              <h3 className="font-semibold text-white">Office</h3>
              <p className="text-slate-400">Islamabad, Pakistan</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Clock className="text-yellow-400" />
            <div>
              <h3 className="font-semibold text-white">Working Hours</h3>
              <p className="text-slate-400">Mon - Fri | 9:00 AM - 6:00 PM</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
