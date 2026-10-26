import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  Star, 
  DownloadCloud, 
  CheckCircle2, 
  ShieldCheck, 
  Terminal, 
  ArrowLeft, 
  ExternalLink, 
  CreditCard, 
  Share2, 
  Bookmark, 
  Sparkles,
  Layers,
  Code2,
  Lock,
  Clock,
  Calendar,
  FileCode,
  Check
} from "lucide-react";
import { DIGITAL_PRODUCTS, StoreProduct } from "@/data/digitalStoreCatalog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = DIGITAL_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return { title: "Product Not Found | Qorlune Store" };

  return {
    title: `${product.title} — Digital Download | Qorlune Store`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.title} | Qorlune Digital Store`,
      description: product.shortDescription,
      images: [{ url: product.icon }],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = DIGITAL_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back to Catalog Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-[#94a3b8]">
        <Link href="/" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Products</span>
        </Link>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span>STORE</span>
          <span>/</span>
          <span className="text-[#38bdf8]">{product.category}</span>
          <span>/</span>
          <span className="text-white truncate max-w-[200px]">{product.title}</span>
        </div>
      </div>

      {/* Main Jampack App-Detail Header */}
      <div className="rounded-2xl bg-[#0f172a] border border-[#1e293b] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0b0f17] p-3 flex items-center justify-center border border-[#334155] shadow-lg flex-shrink-0">
            <Image src={product.icon} alt={product.title} width={64} height={64} className="object-contain" priority />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#007d88]/20 border border-[#007d88]/40 text-[#38bdf8]">
                {product.category}
              </span>
              {product.badge && (
                <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                  {product.badge}
                </span>
              )}
              <span className="text-xs text-[#64748b] font-mono">{product.version}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {product.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#94a3b8] font-medium">
              by <span className="text-white font-semibold">{product.author}</span> · Updated {product.lastUpdated}
            </p>

            <div className="flex items-center gap-4 text-xs pt-1 flex-wrap">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-white font-bold ml-1">{product.rating.toFixed(1)}</span>
                <span className="text-[#64748b] ml-1">({product.reviewCount} customer reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#cbd5e1] font-mono">
                <DownloadCloud className="w-4 h-4 text-sky-400" />
                <span>{product.downloadCount} Total Downloads</span>
              </div>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <a
            href={`https://billing.qorlune.co.uk/pay?item=${encodeURIComponent(product.title)}&amount=${product.price}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#007d88] to-[#0284c7] hover:from-[#00929f] hover:to-[#0369a1] text-white text-sm font-bold shadow-lg shadow-[#007d88]/25 transition-all flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>{product.isFree ? "Free Download" : `Buy Now — $${product.price.toLocaleString()} USD`}</span>
          </a>
        </div>
      </div>

      {/* Main Grid: Content (Left) + Purchase Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Media Gallery, Overview & Technical Specs */}
        <div className="lg:col-span-2 space-y-8">
          {/* Screenshots Gallery / Preview */}
          <div className="rounded-xl bg-[#0f172a] border border-[#1e293b] p-4 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#38bdf8]" />
              <span>Screenshots & Architecture Preview</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {product.screenshots.map((s, idx) => (
                <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-[#334155] bg-[#1e293b] group">
                  <Image src={s} alt={`Screenshot ${idx + 1}`} fill className="object-cover group-hover:scale-105 transition-transform" />
                </div>
              ))}
            </div>
          </div>

          {/* Overview */}
          <div className="rounded-xl bg-[#0f172a] border border-[#1e293b] p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight">Overview & Architecture</h2>
            <p className="text-sm text-[#cbd5e1] leading-relaxed">
              {product.longDescription}
            </p>

            <div className="pt-4 border-t border-[#1e293b] space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#38bdf8]" />
                <span>Key Engineering Highlights</span>
              </h3>
              <ul className="grid grid-cols-1 gap-2 text-xs text-[#94a3b8]">
                {product.architectureHighlights.map((hl, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-2 rounded-lg bg-[#1e293b]/50">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-[#cbd5e1]">{hl}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Features */}
          <div className="rounded-xl bg-[#0f172a] border border-[#1e293b] p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight">Features Included</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {product.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-[#1e293b]/40 border border-[#334155]/40 text-[#cbd5e1]">
                  <CheckCircle2 className="w-4 h-4 text-[#38bdf8] flex-shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables / Included Files */}
          <div className="rounded-xl bg-[#0f172a] border border-[#1e293b] p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight">Deliverables & Formats</h2>
            <div className="space-y-2 text-xs">
              {product.deliverables.map((del, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#1e293b]/60 border border-[#334155]/60 text-white font-mono">
                  <div className="flex items-center gap-2.5">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <span>{del}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Sticky Purchase Box */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="rounded-2xl bg-[#0f172a] border border-[#1e293b] p-6 space-y-6 shadow-2xl">
            {/* Price Badge */}
            <div>
              <div className="text-xs text-[#94a3b8] uppercase font-bold tracking-wider">License Price</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {product.isFree ? (
                    <span className="text-emerald-400">FREE</span>
                  ) : (
                    `$${product.price.toLocaleString()}`
                  )}
                </span>
                {!product.isFree && <span className="text-xs text-[#64748b] font-mono">USD / Perpetual</span>}
              </div>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Instant digital download upon purchase confirmation</span>
              </p>
            </div>

            {/* Quick Specs List */}
            <div className="border-t border-b border-[#1e293b] py-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#94a3b8]">Version</span>
                <span className="text-white font-mono font-medium">{product.version}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94a3b8]">Category</span>
                <span className="text-[#38bdf8] font-medium">{product.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94a3b8]">Publisher</span>
                <span className="text-white font-medium">{product.author}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94a3b8]">License</span>
                <span className="text-white font-medium">Commercial Perpetual</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#94a3b8]">Delivery</span>
                <span className="text-emerald-400 font-medium">Instant ZIP & GitHub Access</span>
              </div>
            </div>

            {/* Tech Stack Pills */}
            <div>
              <div className="text-xs font-semibold text-[#94a3b8] mb-2">Technologies Used</div>
              <div className="flex flex-wrap gap-1.5">
                {product.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-[#1e293b] text-[#cbd5e1] font-mono border border-[#334155]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Primary Action Button */}
            <a
              href={`https://billing.qorlune.co.uk/pay?item=${encodeURIComponent(product.title)}&amount=${product.price}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#007d88] to-[#0284c7] hover:from-[#00929f] hover:to-[#0369a1] text-white text-sm font-bold shadow-xl shadow-[#007d88]/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <CreditCard className="w-4 h-4" />
              <span>{product.isFree ? "Download Now (Instant)" : "Secure Checkout (Paddle/Stripe)"}</span>
            </a>

            {/* Security Guarantee */}
            <div className="space-y-2 text-[11px] text-[#64748b]">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-bit TLS encrypted transaction</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Clean virus-scanned code repository</span>
              </div>
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Access to future version updates</span>
              </div>
            </div>
          </div>

          {/* Need Custom Enterprise Assistance Card */}
          <div className="rounded-xl bg-[#0f172a]/60 border border-[#1e293b] p-5 text-xs text-[#94a3b8] space-y-2">
            <h4 className="font-bold text-white text-sm">Need Custom Implementation?</h4>
            <p className="leading-relaxed">
              Qorlune engineers can deploy, customize, and integrate this architecture directly into your company infrastructure.
            </p>
            <a
              href="https://qorlune.co.uk/#contact"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#38bdf8] hover:underline font-semibold pt-1"
            >
              <span>Schedule Architecture Call</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
