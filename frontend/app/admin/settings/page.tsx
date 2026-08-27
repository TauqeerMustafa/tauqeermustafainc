"use client";

import { useEffect, useState } from "react";

import { AdminField, AdminPageHeader, adminInputClass } from "@/components/admin/AdminUI";
import { useCurrentUser, useUpdateProfile } from "@/hooks/useAuth";
import type { ApiError } from "@/types";

export default function AdminSettingsPage() {
  const { data } = useCurrentUser();
  const user = data?.data;
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.name) return;
    const syncName = window.setTimeout(() => setName(user.name), 0);
    return () => window.clearTimeout(syncName);
  }, [user?.name]);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage(null);
    await updateProfile.mutateAsync({ name });
    setSuccessMessage("Profile updated.");
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setSuccessMessage(null);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    try {
      await updateProfile.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMessage("Password changed.");
    } catch (error) {
      setPasswordError((error as ApiError).message ?? "Could not change password.");
    }
  }

  return (
    <div className="max-w-2xl">
      <AdminPageHeader title="Settings" description="Manage your admin account." />

      {successMessage ? (
        <div className="mb-6 border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {successMessage}
        </div>
      ) : null}

      <form onSubmit={handleProfileSubmit} className="grid gap-5 border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-bold text-white">Profile</h2>
        <AdminField label="Name" htmlFor="settings-name">
          <input
            id="settings-name"
            className={adminInputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </AdminField>
        <AdminField label="Email" htmlFor="settings-email">
          <input
            id="settings-email"
            disabled
            className={`${adminInputClass} cursor-not-allowed opacity-60`}
            value={user?.email ?? ""}
          />
        </AdminField>
        <div>
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:opacity-50"
          >
            {updateProfile.isPending ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>

        {/* Security Settings */}
        <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Security</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
            <AdminField label="Current Password">
              <input
                type="password"
                className={adminInputClass}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </AdminField>
            <AdminField label="New Password">
              <input
                type="password"
                className={adminInputClass}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </AdminField>
            <AdminField label="Confirm New Password">
              <input
                type="password"
                className={adminInputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </AdminField>
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            <button
              type="submit"
              disabled={updateProfile.isPending || !currentPassword || !newPassword}
              className="rounded bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Zoho Mail Integration */}
        <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Zoho Mail Integration</h2>
          <p className="mb-4 text-sm text-gray-500">
            Connect your portal to Zoho One to enable seamless single sign-on (SSO) and in-portal webmail features.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="/api/auth/zoho"
              className="inline-flex items-center justify-center rounded bg-[#1051F1] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0D44CB]"
            >
              Connect Zoho Account
            </a>
            {typeof window !== "undefined" && window.location.search.includes("zoho=connected") && (
              <span className="text-sm font-medium text-green-600">
                ✓ Zoho account connected successfully!
              </span>
            )}
          </div>
        </div>
      </div>
  );
}
