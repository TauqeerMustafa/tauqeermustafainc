export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-center text-sm text-slate-400 md:flex-row">
        <p>
          © {new Date().getFullYear()} Tauqeer Mustafa Inc. All rights reserved.
        </p>

        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition">
            Privacy Policy
          </a>

          <a href="#" className="hover:text-white transition">
            Terms of Service
          </a>

          <a href="#" className="hover:text-white transition">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}