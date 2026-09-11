"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, MapPin, MessageCircle, Search, Users, X } from "lucide-react";
import { communityMembers, type CommunityMember } from "@/data/community";
import { PageHero, Section, Badge, BadgeMuted, MStripe } from "@/components/home/ui";

export default function CommunityMembersView() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CommunityMember | null>(null);

  const filteredMembers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return communityMembers;
    return communityMembers.filter((member) =>
      [member.name, member.role, member.location, member.specialty, member.bio]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [query]);

  return (
    <>
      <PageHero
        eyebrow="Community Network // Engineers & Founders"
        title="Meet the Builders"
        description="Software engineers, security researchers, and system architects collaborating across disciplines and time zones."
      >
        <Link
          href="/community"
          className="inline-flex items-center gap-2 border border-line bg-surface px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-ink hover:border-action hover:text-action transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Discussions</span>
        </Link>
      </PageHero>

      <Section className="bg-canvas py-12 sm:py-16">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-8">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH BY NAME, ROLE, SPECIALTY, OR CITY..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-line font-mono text-xs uppercase tracking-wider text-ink outline-none transition placeholder:text-ink-muted focus:border-action"
            />
          </div>

          <div className="inline-flex items-center justify-center gap-2 border border-line bg-surface px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
            <Users className="h-4 w-4 text-action" aria-hidden />
            <span>{filteredMembers.length} Active Profiles</span>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <article
              key={member.name}
              className="border border-line bg-surface p-6 sm:p-7 flex flex-col justify-between hover:border-action/50 transition group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <button
                    type="button"
                    onClick={() => setSelected(member)}
                    aria-label={`View ${member.name}'s profile`}
                    className="inline-flex h-12 w-12 items-center justify-center font-mono text-xs font-bold text-white cursor-pointer"
                    style={{ background: member.accent }}
                  >
                    {member.initials}
                  </button>

                  <span className="flex items-center gap-1.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Verified
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(member)}
                  className="mt-5 text-left cursor-pointer w-full"
                >
                  <h2 className="text-lg font-bold uppercase tracking-tight text-ink group-hover:text-action transition-colors">
                    {member.name}
                  </h2>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-action">
                    {member.role}
                  </p>
                  <p className="mt-3 text-xs font-light leading-relaxed text-ink-muted line-clamp-2">
                    {member.bio}
                  </p>
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-line space-y-2 text-xs font-mono text-ink-muted">
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-action shrink-0" aria-hidden />
                  <span className="truncate">{member.location}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MessageCircle className="h-3.5 w-3.5 text-action shrink-0" aria-hidden />
                  <span className="truncate">{member.specialty}</span>
                </p>
              </div>
            </article>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="border border-line bg-surface p-12 text-center font-mono text-xs text-ink-muted uppercase">
            <Search className="mx-auto h-6 w-6 text-ink-muted mb-2" aria-hidden />
            <p className="font-bold">No member profiles found</p>
            <p className="mt-1">Try searching with a shorter name or different specialty.</p>
          </div>
        )}
      </Section>

      {/* Member Details Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="member-dialog-title"
        >
          <div className="w-full max-w-lg border border-line bg-surface p-6 sm:p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span
                  className="inline-flex h-12 w-12 items-center justify-center font-mono text-xs font-bold text-white"
                  style={{ background: selected.accent }}
                >
                  {selected.initials}
                </span>
                <div>
                  <h2 id="member-dialog-title" className="text-xl font-bold uppercase text-ink">
                    {selected.name}
                  </h2>
                  <p className="font-mono text-xs text-action uppercase tracking-wider mt-0.5">
                    {selected.role}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close profile"
                className="inline-flex h-8 w-8 items-center justify-center border border-line text-ink-muted hover:border-ink hover:text-ink cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <p className="mt-6 text-sm font-light leading-relaxed text-ink-muted">
              {selected.bio}
            </p>

            <div className="mt-6 space-y-2.5 border-t border-line pt-5 text-xs font-mono text-ink-muted">
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-action shrink-0" aria-hidden />
                <span>{selected.location}</span>
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle className="h-3.5 w-3.5 text-action shrink-0" aria-hidden />
                <span>{selected.specialty}</span>
              </p>
              <p className="text-[10px] uppercase tracking-wider text-ink-muted pt-2 border-t border-line">
                Member since {selected.joined} &bull; {selected.contribution}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

