"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  Grid, 
  List, 
  DownloadCloud, 
  Star, 
  CheckCircle2, 
  Layers, 
  Shield, 
  Cloud, 
  Cpu, 
  Wrench, 
  FileCheck2, 
  ExternalLink, 
  SlidersHorizontal, 
  Sparkles, 
  ArrowRight, 
  X,
  CreditCard,
  Check,
  Zap,
  Tag
} from "lucide-react";
import { DIGITAL_PRODUCTS, STORE_CATEGORIES, StoreProduct } from "@/data/digitalStoreCatalog";

export default function StoreClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Products");
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProductForModal, setSelectedProductForModal] = useState<StoreProduct | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return DIGITAL_PRODUCTS.filter((product) => {
      // Category filter
      if (selectedCategory !== "All Products" && product.category !== selectedCategory) {
        return false;
      }
      // Price filter
      if (selectedPriceFilter === "free" && !product.isFree) return false;
      if (selectedPriceFilter === "under100" && (product.isFree || product.price > 100)) return false;
      if (selectedPriceFilter === "enterprise" && product.price < 1000) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(q);
        const matchesSubtitle = product.subtitle.toLowerCase().includes(q);
        const matchesDesc = product.shortDescription.toLowerCase().includes(q);
        const matchesTech = product.techStack.some((t) => t.toLowerCase().includes(q));
        const matchesCategory = product.category.toLowerCase().includes(q);
        return matchesTitle || matchesSubtitle || matchesDesc || matchesTech || matchesCategory;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "popular") {
        return parseInt(b.downloadCount.replace(/,/g, "")) - parseInt(a.downloadCount.replace(/,/g, ""));
      }
      if (sortBy === "rating") {
        return b.rating - a.rating;
      }
      if (sortBy === "priceAsc") {
        return a.price - b.price;
      }
      if (sortBy === "priceDesc") {
        return b.price - a.price;
      }
      return 0;
    });
  }, [searchQuery, selectedCategory, selectedPriceFilter, sortBy]);

  // Recommended highlights (first 4)
  const recommendedProducts = useMemo(() => {
    return DIGITAL_PRODUCTS.slice(0, 4);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Jampack Hero Header */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#003c44] via-[#005f6b] to-[#0f172a] p-6 sm:p-10 border border-[#007d88]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-[#007d88]/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#007d88]/40 border border-[#38bdf8]/30 text-[#38bdf8] text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Jampack SaaS App Architecture · Official Qorlune Store</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Production-Grade Software, Blueprints & Toolkits
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#cbd5e1] leading-relaxed">
            Download enterprise-tested web architectures, cybersecurity threat playbooks, zero-trust portals, and automated developer utilities. Full source code and commercial license included.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-[#94a3b8]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-white font-medium">100% Commercial Rights</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DownloadCloud className="w-4 h-4 text-sky-400" />
              <span className="text-white font-medium">Instant Digital Delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium">NIST & OWASP Aligned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Jampack Layout (Sidebar + Content) */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden w-full flex items-center justify-between pb-4 border-b border-[#1e293b]">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1e293b] text-sm text-white font-medium"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#38bdf8]" />
            <span>Filters & Categories</span>
          </button>
          <span className="text-xs text-[#94a3b8]">{filteredProducts.length} Products Found</span>
        </div>

        {/* Left Sidebar (Jampack AppsSidebar Replica) */}
        <aside
          className={`w-full lg:w-64 flex-shrink-0 bg-[#0f172a]/80 backdrop-blur border border-[#1e293b] rounded-xl p-5 space-y-6 ${
            isMobileSidebarOpen ? "block" : "hidden lg:block"
          }`}
        >
          {/* Quick Search */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8] mb-2 block">
              Search Products
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search templates, tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#007d88] transition-colors"
              />
            </div>
          </div>

          {/* Browse Navigation */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-2">
              Browse
            </div>
            <ul className="space-y-1 text-xs">
              <li>
                <button
                  onClick={() => { setSelectedCategory("All Products"); setSelectedPriceFilter("all"); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors font-medium text-left ${
                    selectedCategory === "All Products" && selectedPriceFilter === "all"
                      ? "bg-[#007d88] text-white shadow"
                      : "text-[#94a3b8] hover:bg-[#1e293b] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4" />
                    <span>All Products</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-mono">{DIGITAL_PRODUCTS.length}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setSelectedPriceFilter("free"); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors font-medium text-left ${
                    selectedPriceFilter === "free"
                      ? "bg-[#007d88] text-white shadow"
                      : "text-[#94a3b8] hover:bg-[#1e293b] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <span>Free Community Tools</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">Free</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setSortBy("popular"); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors font-medium text-left ${
                    sortBy === "popular"
                      ? "text-white bg-[#1e293b]"
                      : "text-[#94a3b8] hover:bg-[#1e293b] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Most Popular</span>
                  </div>
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="pt-4 border-t border-[#1e293b]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-2">
              Categories
            </div>
            <ul className="space-y-1 text-xs">
              {STORE_CATEGORIES.map((cat) => {
                if (cat === "All Products") return null;
                const count = DIGITAL_PRODUCTS.filter((p) => p.category === cat).length;
                const isSelected = selectedCategory === cat;
                return (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors font-medium text-left ${
                        isSelected
                          ? "bg-[#007d88] text-white shadow"
                          : "text-[#94a3b8] hover:bg-[#1e293b] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {cat === "Web Engineering" && <Layers className="w-4 h-4 text-sky-400 flex-shrink-0" />}
                        {cat === "Cybersecurity" && <Shield className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                        {cat === "Cloud & DevOps" && <Cloud className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                        {cat === "AI Automation" && <Cpu className="w-4 h-4 text-purple-400 flex-shrink-0" />}
                        {cat === "Developer Tools" && <Wrench className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                        {cat === "Compliance & Audit" && <FileCheck2 className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                        <span className="truncate">{cat}</span>
                      </div>
                      <span className="text-[10px] opacity-75 font-mono ml-2">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Price Range */}
          <div className="pt-4 border-t border-[#1e293b]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-2">
              Price Filter
            </div>
            <div className="space-y-1.5 text-xs text-[#94a3b8]">
              <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                <input
                  type="radio"
                  name="price"
                  checked={selectedPriceFilter === "all"}
                  onChange={() => setSelectedPriceFilter("all")}
                  className="accent-[#007d88]"
                />
                <span>All Price Ranges</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                <input
                  type="radio"
                  name="price"
                  checked={selectedPriceFilter === "free"}
                  onChange={() => setSelectedPriceFilter("free")}
                  className="accent-[#007d88]"
                />
                <span>Free Community Tools ($0)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                <input
                  type="radio"
                  name="price"
                  checked={selectedPriceFilter === "under100"}
                  onChange={() => setSelectedPriceFilter("under100")}
                  className="accent-[#007d88]"
                />
                <span>Developer Kits (Under $100)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                <input
                  type="radio"
                  name="price"
                  checked={selectedPriceFilter === "enterprise"}
                  onChange={() => setSelectedPriceFilter("enterprise")}
                  className="accent-[#007d88]"
                />
                <span>Enterprise Blueprints ($1,000+)</span>
              </label>
            </div>
          </div>

          {/* Direct Support Pill */}
          <div className="pt-4 border-t border-[#1e293b]">
            <div className="p-3 rounded-lg bg-[#1e293b]/50 border border-[#334155]/60 text-xs text-[#94a3b8]">
              <div className="font-semibold text-white mb-1">Need a custom license?</div>
              <p className="text-[11px] leading-relaxed mb-2">
                We provide custom corporate enterprise procurement with signed SLAs and vendor NDAs.
              </p>
              <a
                href="https://qorlune.co.uk/#contact"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#38bdf8] hover:underline font-semibold flex items-center gap-1 text-[11px]"
              >
                Contact Sales <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </aside>

        {/* Right Content Area (Jampack integrationsapp-content Replica) */}
        <section className="flex-1 w-full space-y-8">
          {/* Controls Bar (Search count, Sort & View Mode) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0f172a]/60 border border-[#1e293b] p-3 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-[#94a3b8] w-full sm:w-auto">
              <span className="font-semibold text-white">{filteredProducts.length}</span> products in
              <span className="px-2 py-0.5 rounded bg-[#1e293b] text-[#38bdf8] font-medium">
                {selectedCategory}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#1e293b] border border-[#334155] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#007d88]"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>

              {/* View Switcher */}
              <div className="flex items-center rounded-lg bg-[#1e293b] p-0.5 border border-[#334155]">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === "grid" ? "bg-[#007d88] text-white" : "text-[#94a3b8] hover:text-white"
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === "list" ? "bg-[#007d88] text-white" : "text-[#94a3b8] hover:text-white"
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Jampack Curated Recommendations Slider / Row */}
          {selectedCategory === "All Products" && !searchQuery && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Recommended for your team</h2>
                  <p className="text-xs text-[#94a3b8]">Curated digital products engineered by Qorlune LLC</p>
                </div>
                <span className="text-xs text-[#38bdf8] font-medium">Bestsellers</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {recommendedProducts.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedProductForModal(item)}
                    className="group cursor-pointer rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-[#007d88]/60 p-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#007d88]/10 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-[#1e293b] p-1.5 flex items-center justify-center border border-[#334155] group-hover:scale-105 transition-transform">
                          <Image src={item.icon} alt={item.title} width={32} height={32} className="object-contain" />
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#007d88]/30 border border-[#007d88]/60 text-[#38bdf8]">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm text-white group-hover:text-[#38bdf8] transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <div className="text-[11px] text-[#38bdf8] font-medium mb-1.5">{item.category}</div>
                      <p className="text-xs text-[#94a3b8] line-clamp-2 leading-relaxed">
                        {item.shortDescription}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-[#cbd5e1] font-mono text-[11px]">
                        <DownloadCloud className="w-3.5 h-3.5 text-[#38bdf8]" />
                        <span>{item.downloadCount}</span>
                      </div>
                      <div className="font-bold text-white font-mono">
                        {item.isFree ? "Free" : `$${item.price.toLocaleString()} USD`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Product Grid / List */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-xl bg-[#0f172a]/60 border border-[#1e293b] p-12 text-center space-y-3">
              <Search className="w-10 h-10 text-[#64748b] mx-auto opacity-50" />
              <h3 className="text-base font-bold text-white">No products found matching your filter</h3>
              <p className="text-xs text-[#94a3b8] max-w-sm mx-auto">
                Try clearing your search query or switching categories in the sidebar.
              </p>
              <button
                onClick={() => { setSelectedCategory("All Products"); setSearchQuery(""); setSelectedPriceFilter("all"); }}
                className="mt-2 px-4 py-2 rounded-lg bg-[#007d88] text-white text-xs font-semibold hover:bg-[#00929f] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-[#007d88] p-5 transition-all hover:shadow-2xl hover:shadow-[#007d88]/10 flex flex-col justify-between group"
                >
                  <div>
                    {/* Header with Avatar & Badge */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-2 flex items-center justify-center border border-[#334155] shadow group-hover:scale-105 transition-transform">
                        <Image src={product.icon} alt={product.title} width={38} height={38} className="object-contain" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {product.badge && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#007d88]/20 border border-[#007d88]/40 text-[#38bdf8]">
                            {product.badge}
                          </span>
                        )}
                        <span className="text-[10px] text-[#64748b] font-mono">{product.version}</span>
                      </div>
                    </div>

                    {/* Title & Category */}
                    <h3 className="text-base font-bold text-white group-hover:text-[#38bdf8] transition-colors line-clamp-1 mb-1">
                      {product.title}
                    </h3>
                    <div className="text-xs text-[#38bdf8] font-medium mb-2.5 flex items-center gap-1.5">
                      <span>{product.category}</span>
                      <span className="text-[#475569]">·</span>
                      <span className="text-[#94a3b8]">{product.author}</span>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-[#94a3b8] line-clamp-2 leading-relaxed mb-4">
                      {product.shortDescription}
                    </p>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {product.techStack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] px-2 py-0.5 rounded bg-[#1e293b] text-[#cbd5e1] font-mono border border-[#334155]/60"
                        >
                          {tech}
                        </span>
                      ))}
                      {product.techStack.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e293b] text-[#64748b] font-mono">
                          +{product.techStack.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer with Price, Stats & Action */}
                  <div className="pt-4 border-t border-[#1e293b] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-white font-bold ml-1">{product.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-[#64748b] text-[11px]">({product.reviewCount})</span>
                      </div>

                      <div className="flex items-center gap-1 text-[#94a3b8] text-[11px] font-mono">
                        <DownloadCloud className="w-3.5 h-3.5 text-sky-400" />
                        <span>{product.downloadCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div>
                        <div className="text-[10px] text-[#64748b] uppercase tracking-wider font-semibold">Price</div>
                        <div className="text-base font-extrabold text-white font-mono">
                          {product.isFree ? (
                            <span className="text-emerald-400">FREE</span>
                          ) : (
                            `$${product.price.toLocaleString()}`
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedProductForModal(product)}
                          className="px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-medium transition-colors"
                        >
                          Quick View
                        </button>
                        <Link
                          href={`/store/${product.slug}`}
                          className="px-3.5 py-1.5 rounded-lg bg-[#007d88] hover:bg-[#00929f] text-white text-xs font-semibold shadow-md shadow-[#007d88]/20 transition-all flex items-center gap-1"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-[#007d88] p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-2 flex items-center justify-center border border-[#334155] flex-shrink-0">
                      <Image src={product.icon} alt={product.title} width={42} height={42} className="object-contain" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white group-hover:text-[#38bdf8] transition-colors">
                          {product.title}
                        </h3>
                        {product.badge && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#007d88]/20 border border-[#007d88]/40 text-[#38bdf8]">
                            {product.badge}
                          </span>
                        )}
                        <span className="text-xs text-[#38bdf8] font-medium">({product.category})</span>
                      </div>
                      <p className="text-xs text-[#94a3b8] line-clamp-1 leading-relaxed">
                        {product.shortDescription}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-[#64748b] pt-1">
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-white font-semibold text-xs">{product.rating.toFixed(1)}</span>
                          <span className="text-[#64748b]">({product.reviewCount} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono">
                          <DownloadCloud className="w-3.5 h-3.5 text-sky-400" />
                          <span>{product.downloadCount} downloads</span>
                        </div>
                        <span className="font-mono text-[#64748b]">{product.version}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-[#1e293b]">
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-white font-mono">
                        {product.isFree ? (
                          <span className="text-emerald-400">FREE</span>
                        ) : (
                          `$${product.price.toLocaleString()} USD`
                        )}
                      </div>
                      <div className="text-[10px] text-[#64748b]">Instant Delivery</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedProductForModal(product)}
                        className="px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-medium transition-colors"
                      >
                        Quick View
                      </button>
                      <Link
                        href={`/store/${product.slug}`}
                        className="px-3.5 py-1.5 rounded-lg bg-[#007d88] hover:bg-[#00929f] text-white text-xs font-semibold transition-all flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Quick View / Purchase Modal (Jampack Review & Detail Modal Replica) */}
      {selectedProductForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedProductForModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg bg-[#1e293b] text-[#94a3b8] hover:text-white hover:bg-[#334155] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 pr-8">
              <div className="w-14 h-14 rounded-xl bg-[#1e293b] p-2 flex items-center justify-center border border-[#334155] flex-shrink-0">
                <Image src={selectedProductForModal.icon} alt={selectedProductForModal.title} width={42} height={42} className="object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#007d88]/20 border border-[#007d88]/40 text-[#38bdf8]">
                    {selectedProductForModal.category}
                  </span>
                  <span className="text-xs text-[#64748b] font-mono">{selectedProductForModal.version}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{selectedProductForModal.title}</h3>
                <p className="text-xs text-[#94a3b8] mt-0.5">{selectedProductForModal.subtitle}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              {selectedProductForModal.longDescription}
            </p>

            {/* Architecture Highlights */}
            <div className="p-4 rounded-xl bg-[#1e293b]/50 border border-[#334155]/60 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Architecture Highlights</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#94a3b8]">
                {selectedProductForModal.architectureHighlights.map((hl, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Deliverables / What's Included */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-white mb-2.5">
                Deliverables Included
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedProductForModal.deliverables.map((del, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[#1e293b] text-[#cbd5e1]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8] flex-shrink-0" />
                    <span className="truncate">{del}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer / Checkout Trigger */}
            <div className="pt-4 border-t border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs text-[#94a3b8]">Commercial License Price</div>
                <div className="text-2xl font-extrabold text-white font-mono">
                  {selectedProductForModal.isFree ? (
                    <span className="text-emerald-400">FREE</span>
                  ) : (
                    `$${selectedProductForModal.price.toLocaleString()} USD`
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  href={`/store/${selectedProductForModal.slug}`}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-semibold text-center transition-colors"
                >
                  Full Specs Page
                </Link>
                <a
                  href={`https://billing.qorlune.co.uk/pay?item=${encodeURIComponent(selectedProductForModal.title)}&amount=${selectedProductForModal.price}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#007d88] to-[#0284c7] hover:from-[#00929f] hover:to-[#0369a1] text-white text-xs font-bold shadow-lg shadow-[#007d88]/20 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{selectedProductForModal.isFree ? "Download Now" : "Secure Checkout"}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
