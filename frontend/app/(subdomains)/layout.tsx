import Image from "next/image";
import Link from "next/link";

export default function SubdomainsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Centered Minimal Header */}
      <header className="flex items-center justify-center h-20 border-b border-black/5 bg-white/50 backdrop-blur-md">
        <Link 
          href="https://www.tauqeermustafa.tech/"
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <Image 
            src="/logo-mark.svg" 
            alt="TMI Logo" 
            width={32} 
            height={32} 
            className="h-8 w-auto"
          />
          <span className="text-[15px] font-bold tracking-tight text-ink">
            Tauqeer Mustafa Inc
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Centered Minimal Footer */}
      <footer className="flex items-center justify-center h-16 border-t border-black/5 bg-white/50 backdrop-blur-md text-sm text-ink-lighter">
        <div className="flex items-center gap-4">
          <span>&copy; {new Date().getFullYear()} Tauqeer Mustafa Inc.</span>
          <span className="text-ink/20">|</span>
          <Link 
            href="https://www.tauqeermustafa.tech/contact" 
            className="hover:text-ink transition-colors"
          >
            Support
          </Link>
        </div>
      </footer>
    </div>
  );
}
