"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { useCurrentUser } from "@/hooks/useAuth";
import {
  PORTAL_HOME_PATH,
  PORTAL_LABEL,
  canAccessPortal,
  portalsForRole,
  roleLabel,
  type PortalId,
} from "@/lib/rbac";
import { currentLocationPath, loginUrlWithReturnTo } from "@/lib/return-to";
import { useAuthContext } from "@/providers/auth-provider";

/** Full-bleed message panel used for every terminal guard state. */
function GuardNotice({
  title,
  body,
  children,
}: {
  title: string;
  body?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center"
      style={{ background: "var(--adm-bg)" }}
    >
      <div className="m-stripe w-24" />
      <h1
        className="text-xl font-bold uppercase tracking-wide"
        style={{ color: "var(--adm-text)" }}
      >
        {title}
      </h1>
      {body && (
        <p className="max-w-md text-sm" style={{ color: "var(--adm-text-3)" }}>
          {body}
        </p>
      )}
      {children && <div className="flex flex-wrap items-center justify-center gap-3">{children}</div>}
    </div>
  );
}

function GuardLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-none px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:opacity-90"
      style={{ background: "var(--adm-blue)" }}
    >
      {label}
    </Link>
  );
}

export default function PortalGuard({
  portal,
  children,
}: {
  portal: PortalId;
  children: ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const { data, isError } = useCurrentUser();

  const user = data?.data;
  const stillChecking = !user && !isError;

  // The page we turned away, so signing in again re-opens the link the person
  // actually followed instead of dumping them on the dashboard. Captured once,
  // during the first render, before any redirect can rewrite the URL — the
  // server pass returns "" and only the "session expired" branch reads it, so
  // there is nothing for hydration to disagree about.
  const [returnTo] = useState(currentLocationPath);

  useEffect(() => {
    if (!isAuthenticated || isError) {
      // Read the location here rather than from state: on a first-paint bounce
      // the state has not settled yet, but `window` is already accurate.
      router.replace(loginUrlWithReturnTo(portal, currentLocationPath()));
    }
  }, [isAuthenticated, isError, router, portal]);

  if (!isAuthenticated) {
    return null;
  }

  if (stillChecking) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-sm"
        style={{ background: "var(--adm-bg)", color: "var(--adm-text-3)" }}
      >
        Checking your session…
      </div>
    );
  }

  if (isError) {
    return (
      <GuardNotice
        title="Session expired"
        body="Your session is no longer valid. Sign in again to continue."
      >
        <GuardLink href={loginUrlWithReturnTo(portal, returnTo)} label="Back to login" />
      </GuardNotice>
    );
  }

  // Role is checked against the portal access matrix in lib/rbac — the one
  // place that knows the backend emits lowercase slugs.
  if (!canAccessPortal(user?.role, portal)) {
    const allowed = portalsForRole(user?.role);

    return (
      <GuardNotice
        title={`No ${PORTAL_LABEL[portal]} access`}
        body={`You are signed in as ${roleLabel(user?.role)}, which cannot open the ${PORTAL_LABEL[
          portal
        ].toLowerCase()} portal.`}
      >
        {allowed.map((target) => (
          <GuardLink
            key={target}
            href={PORTAL_HOME_PATH[target]}
            label={`Go to ${PORTAL_LABEL[target]}`}
          />
        ))}
        {allowed.length === 0 && <GuardLink href="/portals" label="Choose a portal" />}
      </GuardNotice>
    );
  }

  return <>{children}</>;
}
