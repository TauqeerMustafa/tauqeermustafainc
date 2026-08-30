"use client";

import { useEffect, useState } from "react";
import { KeyRound, LogOut, ShieldCheck, UserRound } from "lucide-react";

import {
  ErrorBlock,
  Field,
  LoadingBlock,
  Panel,
  PortalButton,
  inputClass,
} from "@/components/portal/PortalUI";
import { useCurrentUser, useLogout, useUpdateProfile } from "@/hooks/useAuth";
import { roleLabel } from "@/lib/rbac";

/**
 * Real account settings for the staff portals, wired to `/auth/me`.
 *
 * Replaces the old `SettingsWrapper` facade, whose password form posted nowhere
 * and whose "maintenance mode" button did nothing. Name and password changes go
 * through `PUT /auth/me` (`useUpdateProfile`); role and permissions are shown
 * read-only because they are granted by an admin, not self-selected.
 */
export default function AccountSettings() {
  const { data, isLoading, isError, error, refetch } = useCurrentUser();
  const user = data?.data ?? null;
  const updateProfile = useUpdateProfile();
  const logout = useLogout();

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Seed the name field once the profile arrives; the user can then edit it.
  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  if (isLoading) return <LoadingBlock label="Loading your account…" />;
  if (isError || !user) {
    return (
      <ErrorBlock
        message={error instanceof Error ? error.message : "Could not load your account."}
        onRetry={() => refetch()}
      />
    );
  }

  async function saveName() {
    setNotice(null);
    setLocalError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setLocalError("Your name cannot be empty.");
      return;
    }
    try {
      await updateProfile.mutateAsync({ name: trimmed });
      setNotice("Profile updated.");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Could not update your profile.");
    }
  }

  async function savePassword() {
    setNotice(null);
    setLocalError(null);
    if (!currentPassword || !newPassword) {
      setLocalError("Enter your current and new password.");
      return;
    }
    if (newPassword.length < 8) {
      setLocalError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError("New password and confirmation do not match.");
      return;
    }
    try {
      await updateProfile.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice("Password changed.");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Could not change your password.");
    }
  }

  const permissions = user.permissions ?? [];
  const busy = updateProfile.isPending;

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      {notice ? (
        <p className="border border-adm-green bg-adm-green-light px-4 py-3 text-sm text-adm-text">
          {notice}
        </p>
      ) : null}
      {localError ? <ErrorBlock message={localError} /> : null}

      <Panel title="Profile" icon={UserRound}>
        <div className="flex flex-col gap-5">
          <Field label="Full name" htmlFor="account-name">
            <input
              id="account-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Email" htmlFor="account-email" hint="Contact an administrator to change this.">
            <input id="account-email" value={user.email} readOnly disabled className={inputClass} />
          </Field>
          <div>
            <PortalButton onClick={saveName} disabled={busy}>
              Save profile
            </PortalButton>
          </div>
        </div>
      </Panel>

      <Panel title="Password" icon={KeyRound}>
        <div className="flex flex-col gap-5">
          <Field label="Current password" htmlFor="account-current">
            <input
              id="account-current"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="New password" htmlFor="account-new">
              <input
                id="account-new"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Confirm new password" htmlFor="account-confirm">
              <input
                id="account-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <div>
            <PortalButton onClick={savePassword} disabled={busy}>
              Change password
            </PortalButton>
          </div>
        </div>
      </Panel>

      <Panel title="Access" icon={ShieldCheck}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-adm-text-2">Role</span>
            <span className="font-bold text-adm-text">{roleLabel(user.role)}</span>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-adm-text-2">
              Permissions
            </p>
            {permissions.length === 0 ? (
              <p className="text-sm text-adm-text-3">
                No explicit permissions — access follows your role.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {permissions.map((permission) => (
                  <span
                    key={permission}
                    className="border border-adm-border bg-adm-surface-2 px-2.5 py-1 text-xs text-adm-text-2"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Panel>

      <Panel title="Session" icon={LogOut}>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-adm-text-2">Sign out of this device.</p>
          <PortalButton variant="danger" icon={LogOut} onClick={logout}>
            Sign out
          </PortalButton>
        </div>
      </Panel>
    </div>
  );
}
