"use client";

import Link from "next/link";
import {
  Mail,
  MessageCircle,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";

import { useMessages } from "@/hooks/useMessages";
import { useI18n } from "@/lib/i18n";

export type CommunicationsFunctionId = "whatsapp" | "mail" | "client-messages" | "messages";

interface CommunicationsBannerProps {
  active?: CommunicationsFunctionId;
  compact?: boolean;
}

interface FunctionItem {
  id: CommunicationsFunctionId;
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
  countKey?: "inquiries";
}

const COMMUNICATIONS_FUNCTIONS: FunctionItem[] = [
  {
    id: "whatsapp",
    label: "WhatsApp Business",
    shortLabel: "WhatsApp",
    href: "/admin/whatsapp",
    icon: MessageCircle,
  },
  {
    id: "mail",
    label: "Webmail Mailboxes",
    shortLabel: "Webmail",
    href: "/admin/mail",
    icon: Mail,
  },
  {
    id: "client-messages",
    label: "Client Portal Messages",
    shortLabel: "Client Portal",
    href: "/admin/client-messages",
    icon: MessagesSquare,
  },
  {
    id: "messages",
    label: "Website Inquiries",
    shortLabel: "Inquiries",
    href: "/admin/messages",
    icon: Mail,
    countKey: "inquiries",
  },
];

export default function CommunicationsBanner({
  active = "whatsapp",
  compact = false,
}: CommunicationsBannerProps) {
  const { t } = useI18n();
  const inquiriesQuery = useMessages({ unreadOnly: true });

  const unreadCount = inquiriesQuery.data?.data?.items?.length ?? 0;

  return (
    <div className="relative overflow-hidden rounded-[18px] border border-adm-border bg-adm-surface p-5 sm:p-6">
      <div className="flex flex-col gap-5">
        {/* Top title & summary section */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-adm-border bg-adm-surface-2 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-adm-text-3">
              <span className="h-1.5 w-1.5 rounded-full bg-adm-blue shrink-0" />
              <span>{t("Communications & Messaging")}</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-adm-text sm:text-2xl">
              {t("Unified Communications Hub")}
            </h2>
            {!compact && (
              <p className="mt-1 max-w-2xl text-xs font-normal leading-relaxed text-adm-text-3 sm:text-sm">
                {t(
                  "Monitor and reply across all customer channels: WhatsApp Cloud API, company Webmail, Client Portal direct threads, and website inquiries.",
                )}
              </p>
            )}
          </div>

          {/* Real-time pulse stats */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-2 rounded-full border border-adm-border bg-adm-surface-2 px-3 py-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-adm-green" />
              <span className="text-adm-text-3">{t("WhatsApp Line:")}</span>
              <span className="font-semibold text-adm-green">{t("Connected")}</span>
            </div>
            {unreadCount > 0 ? (
              <div className="flex items-center gap-2 rounded-full border border-adm-amber/30 bg-adm-amber-light px-3 py-1 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-adm-amber" />
                <span className="font-semibold text-adm-amber">
                  {unreadCount} {t("unread inquiries")}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full border border-adm-border bg-adm-surface-2 px-3 py-1 text-xs">
                <span className="text-adm-text-3">{t("Inquiries:")}</span>
                <span className="font-semibold text-adm-text">{t("Inbox zero")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Function navigation capsules */}
        <div className="border-t border-adm-border pt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-adm-text-3">
            {t("Communications Channels")}
          </p>
          <nav
            aria-label={t("Communications channels")}
            className="flex flex-wrap items-center gap-2"
          >
            {COMMUNICATIONS_FUNCTIONS.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              const count = item.countKey === "inquiries" ? unreadCount : undefined;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                    isActive
                      ? "bg-adm-blue text-white font-semibold"
                      : "border border-adm-border bg-adm-surface text-adm-text-2 hover:border-adm-border-2 hover:bg-adm-surface-2 hover:text-adm-text"
                  }`}
                >
                  <Icon
                    size={14}
                    className={`shrink-0 ${isActive ? "text-white" : "text-adm-text-3"}`}
                  />
                  <span>{t(item.shortLabel)}</span>
                  {typeof count === "number" && count > 0 && (
                    <span
                      className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium tabular-nums ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "border border-adm-amber/30 bg-adm-amber-light text-adm-amber"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
