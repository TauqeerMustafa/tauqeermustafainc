"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Globe,
  KeyRound,
  LogOut,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa6";

import {
  Avatar,
  ErrorBlock,
  Field,
  LoadingBlock,
  Panel,
  PortalButton,
  Tabs,
  inputClass,
} from "@/components/portal/PortalUI";
import { useCurrentUser, useLogout, useUpdateProfile, useUploadAvatar } from "@/hooks/useAuth";
import { roleLabel } from "@/lib/rbac";

/**
 * Real account settings for staff portals (Employee, Management, Admin), wired to `/auth/me`.
 *
 * Supports updating:
 * - Profile photo (upload local file or specify direct image URL)
 * - Full Name, Job Title / Headline, Phone, Location
 * - Professional Bio / Summary
 * - Technical Skills
 * - GitHub & LinkedIn profiles
 * - HR Emergency Contact
 * - Password changes
 * - Role & permissions (read-only inspection)
 */
export default function AccountSettings() {
  const { data, isLoading, isError, error, refetch } = useCurrentUser();
  const user = data?.data ?? null;
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const logout = useLogout();

  type SettingsTab = "profile" | "password" | "access" | "session";
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile fields
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Avatar URL modal state
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback states
  const [notice, setNotice] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Seed form state when user data arrives
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setTitle(user.title || "");
      setPhone(user.phone || "");
      setLocation(user.location || "");
      setBio(user.bio || "");
      setSkills(user.skills || "");
      setGithubUrl(user.githubUrl || "");
      setLinkedinUrl(user.linkedinUrl || "");
      setEmergencyContact(user.emergencyContact || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  if (isLoading) return <LoadingBlock label="Loading your account…" />;
  if (isError || !user) {
    return (
      <ErrorBlock
        message={error instanceof Error ? error.message : "Could not load your account."}
        onRetry={() => refetch()}
      />
    );
  }

  const settingsTabs = [
    { id: "profile" as const, label: "Profile" },
    { id: "password" as const, label: "Password & Security" },
    { id: "access" as const, label: "Role & Permissions" },
    { id: "session" as const, label: "Session" },
  ];

  // Handle local file upload
  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setLocalError("Photo size must be less than 5MB.");
      return;
    }

    setNotice(null);
    setLocalError(null);

    try {
      const res = await uploadAvatar.mutateAsync(file);
      if (res.data?.avatarUrl) {
        setAvatarUrl(res.data.avatarUrl);
      }
      setNotice("Profile photo uploaded successfully.");
      refetch();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to upload photo.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  // Handle setting image by URL
  async function handleSetAvatarUrl() {
    if (!urlInput.trim()) return;
    setNotice(null);
    setLocalError(null);
    try {
      await updateProfile.mutateAsync({ avatarUrl: urlInput.trim() });
      setAvatarUrl(urlInput.trim());
      setIsUrlModalOpen(false);
      setUrlInput("");
      setNotice("Profile photo URL updated.");
      refetch();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to update photo URL.");
    }
  }

  // Handle removing profile photo
  async function handleRemoveAvatar() {
    setNotice(null);
    setLocalError(null);
    try {
      await updateProfile.mutateAsync({ avatarUrl: "" });
      setAvatarUrl("");
      setNotice("Profile photo removed.");
      refetch();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to remove photo.");
    }
  }

  async function saveProfile() {
    setNotice(null);
    setLocalError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setLocalError("Your name cannot be empty.");
      return;
    }
    try {
      await updateProfile.mutateAsync({
        name: trimmedName,
        title: title.trim(),
        phone: phone.trim(),
        location: location.trim(),
        bio: bio.trim(),
        skills: skills.trim(),
        githubUrl: githubUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        emergencyContact: emergencyContact.trim(),
      });
      setNotice("Profile updated successfully.");
      refetch();
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
  const busy = updateProfile.isPending || uploadAvatar.isPending;

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      {notice ? (
        <p className="border border-adm-green bg-adm-green-light px-4 py-3 text-sm text-adm-text">
          {notice}
        </p>
      ) : null}
      {localError ? <ErrorBlock message={localError} /> : null}

      <Tabs tabs={settingsTabs} value={activeTab} onChange={setActiveTab} />

      {activeTab === "profile" && (
        <Panel title="Profile & Personal Info" icon={UserRound}>
          <div className="flex flex-col gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar
                size={84}
                name={name || user.name}
                src={avatarUrl || user.avatarUrl}
              />
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-adm-text">Profile Picture</span>
                <p className="text-xs text-adm-text-3">
                  Upload a photo or enter an image link. JPG, PNG, GIF or WebP (max 5MB).
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelected}
                    className="hidden"
                  />
                  <PortalButton
                    variant="primary"
                    icon={Upload}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={busy}
                  >
                    Upload Photo
                  </PortalButton>

                  <PortalButton
                    variant="ghost"
                    icon={Globe}
                    onClick={() => setIsUrlModalOpen((prev) => !prev)}
                    disabled={busy}
                  >
                    Image Link
                  </PortalButton>

                  {(avatarUrl || user.avatarUrl) && (
                    <PortalButton
                      variant="danger"
                      icon={Trash2}
                      onClick={() => handleRemoveAvatar()}
                      disabled={busy}
                    >
                      Remove
                    </PortalButton>
                  )}
                </div>

                {isUrlModalOpen && (
                  <div className="mt-2 flex flex-col gap-2 rounded-none border border-adm-border bg-adm-surface-2 p-3 sm:flex-row sm:items-center">
                    <input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className={inputClass}
                    />
                    <div className="flex items-center gap-2">
                      <PortalButton onClick={() => handleSetAvatarUrl()} disabled={busy || !urlInput.trim()}>
                        Apply
                      </PortalButton>
                      <PortalButton
                        variant="ghost"
                        icon={X}
                        onClick={() => {
                          setIsUrlModalOpen(false);
                          setUrlInput("");
                        }}
                      >
                        Cancel
                      </PortalButton>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <hr className="border-adm-border" />

            {/* Name and Title */}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" htmlFor="account-name">
                <input
                  id="account-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. John Doe"
                  className={inputClass}
                />
              </Field>

              <Field label="Job Title / Role Headline" htmlFor="account-title">
                <input
                  id="account-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className={inputClass}
                />
              </Field>
            </div>

            {/* Email and Phone */}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email address" htmlFor="account-email" hint="Contact an administrator to change work email.">
                <input id="account-email" value={user.email} readOnly disabled className={inputClass} />
              </Field>

              <Field label="Phone number" htmlFor="account-phone">
                <input
                  id="account-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+92 300 1234567"
                  className={inputClass}
                />
              </Field>
            </div>

            {/* Location */}
            <Field label="Office Location / City" htmlFor="account-location">
              <input
                id="account-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. Islamabad, Pakistan / Remote"
                className={inputClass}
              />
            </Field>

            {/* Bio */}
            <Field label="About / Professional Bio" htmlFor="account-bio">
              <textarea
                id="account-bio"
                rows={3}
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Brief summary of your background, specialties, and role at TMI..."
                className={inputClass}
              />
            </Field>

            {/* Technical Skills */}
            <Field
              label="Technical Skills & Competencies"
              htmlFor="account-skills"
              hint="Comma-separated list (e.g. Next.js, FastAPI, Python, PostgreSQL, Docker)"
            >
              <input
                id="account-skills"
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
                placeholder="Next.js, FastAPI, Python, PostgreSQL, Docker"
                className={inputClass}
              />
            </Field>

            <hr className="border-adm-border" />

            {/* Social & Professional Links */}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="GitHub Profile URL" htmlFor="account-github">
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-adm-text-3">
                    <FaGithub size={15} />
                  </span>
                  <input
                    id="account-github"
                    type="url"
                    value={githubUrl}
                    onChange={(event) => setGithubUrl(event.target.value)}
                    placeholder="https://github.com/username"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </Field>

              <Field label="LinkedIn Profile URL" htmlFor="account-linkedin">
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-adm-text-3">
                    <FaLinkedin size={15} />
                  </span>
                  <input
                    id="account-linkedin"
                    type="url"
                    value={linkedinUrl}
                    onChange={(event) => setLinkedinUrl(event.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </Field>
            </div>

            {/* Emergency Contact */}
            <Field
              label="HR Emergency Contact"
              htmlFor="account-emergency"
              hint="Confidential contact for HR and operations in case of workplace emergencies."
            >
              <input
                id="account-emergency"
                value={emergencyContact}
                onChange={(event) => setEmergencyContact(event.target.value)}
                placeholder="e.g. Jane Doe (Spouse) - +92 300 7654321"
                className={inputClass}
              />
            </Field>

            <div className="pt-2">
              <PortalButton onClick={saveProfile} disabled={busy}>
                {busy ? "Saving Changes..." : "Save Profile Details"}
              </PortalButton>
            </div>
          </div>
        </Panel>
      )}

      {activeTab === "password" && (
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
      )}

      {activeTab === "access" && (
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
      )}

      {activeTab === "session" && (
        <Panel title="Session" icon={LogOut}>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-adm-text-2">Sign out of this device.</p>
            <PortalButton variant="danger" icon={LogOut} onClick={logout}>
              Sign out
            </PortalButton>
          </div>
        </Panel>
      )}
    </div>
  );
}
