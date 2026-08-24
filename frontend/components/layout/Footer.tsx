export default function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-[#F8FAFC]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-center text-sm text-[#6B7280] md:flex-row">
        <p>
          © {new Date().getFullYear()} Tauqeer Mustafa Inc. All rights reserved.
        </p>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          <a
            href="#"
            className="transition hover:text-[#A67C00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227]"
          >
            Privacy Policy
          </a>

          <a
            href="#"
            className="transition hover:text-[#A67C00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227]"
          >
            Terms of Service
          </a>

          <a
            href="#"
            className="transition hover:text-[#A67C00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A227]"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
