import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function SubdomainsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      {/* Centered Minimal Header */}
      <header className="flex flex-col border-b border-ink/5 bg-canvas/50 backdrop-blur-md">
        <div className="m-stripe" aria-hidden="true" />
        <div className="flex items-center justify-between px-6 h-[76px]">
          {/* Empty div for balancing */}
          <div className="w-10"></div>
          
          <Link 
            href="https://www.tauqeermustafa.tech/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <Image 
              src="/logo-mark.svg" 
              alt="TMI Logo" 
              width={32} 
              height={32} 
              className="h-8 w-auto dark:invert"
            />
            <span className="text-[15px] font-bold tracking-tight text-ink hidden sm:block">
              Tauqeer Mustafa Inc
            </span>
          </Link>
          
          <div className="flex items-center justify-end w-10">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Centered Minimal Footer */}
      <footer className="flex flex-col border-t border-ink/5 bg-canvas/50 backdrop-blur-md">
        <div className="flex items-center justify-center h-[60px] text-sm text-ink-lighter">
          <div className="flex items-center gap-4">
            <span>&copy; {new Date().getFullYear()} Tauqeer Mustafa Inc.</span>
            <span className="text-ink/20">|</span>
            <Link 
              href="https://www.tauqeermustafa.tech/support" 
              className="hover:text-ink transition-colors"
            >
              Support
            </Link>
          </div>
        </div>
        <div className="m-stripe" aria-hidden="true" />
      </footer>
    </div>
  );
}
