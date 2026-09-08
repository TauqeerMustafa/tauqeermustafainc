"use client";

import Link from "next/link";
import {
  Building2,
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
    icon: Building2,
  },
  {
    id: "messages",
    label: "Website Inquiries",
    shortLabel: "Inquiries",
    href: "/admin/messages",
    icon: MessagesSquare,
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
    <div className="flex flex-col gap-3 border-b border-adm-border pb-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Department indicator */}
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-adm-blue shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider text-adm-text">
            {t("Communications")}
          </span>
          {unreadCount > 0 && (
            <span className="rounded-full border border-adm-amber/30 bg-adm-amber-light px-2 py-0.5 text-[11px] font-medium text-adm-amber tabular-nums">
              {unreadCount} {t("unread")}
            </span>
          )}
        </div>

        {/* Function pills */}
        <nav
          aria-label={t("Communications channels")}
          className="flex flex-wrap items-center gap-1.5"
        >
          {COMMUNICATIONS_FUNCTIONS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            const count = item.countKey === "inquiries" ? unreadCount : undefined;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`inline-flex items-center gap-1.5 rounded-none px-3 py-1 text-xs font-medium transition active:scale-95 ${
                  isActive
                    ? "bg-adm-blue text-white font-semibold"
                    : "border border-adm-border bg-adm-surface text-adm-text-2 hover:border-adm-border-2 hover:bg-adm-surface-2 hover:text-adm-text"
                }`}
              >
                <Icon size={13} className={isActive ? "text-white" : "text-adm-text-3"} />
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
  );
}
