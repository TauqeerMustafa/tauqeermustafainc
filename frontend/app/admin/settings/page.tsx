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

      <form onSubmit={handlePasswordSubmit} className="mt-6 grid gap-5 border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-bold text-white">Change password</h2>
        <AdminField label="Current password" htmlFor="settings-current-password">
          <input
            id="settings-current-password"
            type="password"
            className={adminInputClass}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </AdminField>
        <AdminField label="New password" htmlFor="settings-new-password">
          <input
            id="settings-new-password"
            type="password"
            className={adminInputClass}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </AdminField>
        <AdminField label="Confirm new password" htmlFor="settings-confirm-password">
          <input
            id="settings-confirm-password"
            type="password"
            className={adminInputClass}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </AdminField>
        {passwordError ? <p className="text-sm text-red-400">{passwordError}</p> : null}
        <div>
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:opacity-50"
          >
            {updateProfile.isPending ? "Saving..." : "Change password"}
          </button>
        </div>
      </form>
    </div>
  );
}
