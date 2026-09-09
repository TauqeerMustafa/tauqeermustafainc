"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  Briefcase,
  Camera,
  Check,
  Edit3,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa6";

import { useCurrentUser, useUpdateProfile, useUploadAvatar } from "@/hooks/useAuth";
import { PortalButton, inputClass } from "@/components/portal/PortalUI";
import { roleLabel } from "@/lib/rbac";

export default function MyProfilePage() {
  const { data, isLoading, refetch } = useCurrentUser();
  const user = data?.data;

  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const [isEditing, setIsEditing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
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
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize form state from user data
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

  // Handle local file upload
  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation: max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Photo size must be less than 5MB.");
      return;
    }

    setNotice(null);
    setErrorMessage(null);

    try {
      const res = await uploadAvatar.mutateAsync(file);
      if (res.data?.avatarUrl) {
        setAvatarUrl(res.data.avatarUrl);
      }
      setNotice("Profile picture updated successfully.");
      refetch();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to upload photo.");
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
    setErrorMessage(null);
    try {
      await updateProfile.mutateAsync({ avatarUrl: urlInput.trim() });
      setAvatarUrl(urlInput.trim());
      setIsUrlModalOpen(false);
      setUrlInput("");
      setNotice("Profile photo URL updated.");
      refetch();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update photo URL.");
    }
  }

  // Handle removing profile photo
  async function handleRemoveAvatar() {
    setNotice(null);
    setErrorMessage(null);
    try {
      await updateProfile.mutateAsync({ avatarUrl: "" });
      setAvatarUrl("");
      setNotice("Profile picture removed.");
      refetch();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to remove photo.");
    }
  }

  // Save all profile changes
  async function handleSaveProfile(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setNotice(null);
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Full name cannot be empty.");
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
        avatarUrl: avatarUrl.trim(),
      });
      setNotice("Your profile has been saved successfully.");
      setIsEditing(false);
      refetch();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save profile changes.");
    }
  }

  const parsedSkills = (user?.skills || skills)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-adm-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-1.5 bg-action" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-action">
              Staff Portal // Identity
            </span>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-adm-text">
            My Profile
          </h1>
          <p className="text-xs text-adm-text-3 mt-1">
            Manage your personal profile picture, contact details, technical proficiencies, and public links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <PortalButton variant="primary" onClick={() => setIsEditing(true)}>
              <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit Profile
            </PortalButton>
          ) : (
            <div className="flex items-center gap-2">
              <PortalButton variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </PortalButton>
              <PortalButton
                variant="primary"
                onClick={() => handleSaveProfile()}
                disabled={updateProfile.isPending}
              >
                <Check className="mr-1.5 h-3.5 w-3.5" /> Save Changes
              </PortalButton>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {notice && (
        <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-400">
          <Check className="h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Hero Overview Card */}
      <div className="border border-adm-border bg-adm-surface overflow-hidden">
        {/* Top Banner Stripe */}
        <div className="h-24 bg-gradient-to-r from-adm-surface-2 via-adm-surface to-adm-surface-2 border-b border-adm-border relative">
          <div className="absolute top-3 right-4 flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border border-adm-border bg-adm-surface text-adm-text-2">
              {roleLabel(user?.role)}
            </span>
            <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Member
            </span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end gap-5">
          {/* Avatar Container */}
          <div className="relative -mt-12 h-28 w-28 shrink-0 overflow-hidden border-2 border-adm-border bg-adm-surface-2 shadow-xl group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.name ?? "Profile photo"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center font-mono text-3xl font-bold text-adm-blue bg-adm-surface-2">
                {user?.name?.charAt(0) || "U"}
              </div>
            )}

            {/* Hover Action Overlay */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 text-white rounded-none w-full text-center flex items-center justify-center gap-1"
                title="Upload Photo from disk"
              >
                <Camera className="h-3 w-3" /> Upload
              </button>
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(true)}
                className="px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white/90 rounded-none w-full text-center flex items-center justify-center gap-1"
                title="Enter Image URL"
              >
                <Globe className="h-3 w-3" /> URL
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="px-2 py-0.5 text-[9px] font-mono uppercase text-rose-300 hover:text-rose-100 flex items-center justify-center gap-1"
                  title="Remove Photo"
                >
                  <Trash2 className="h-2.5 w-2.5" /> Remove
                </button>
              )}
            </div>
          </div>

          {/* Identity Info */}
          <div className="flex-1 min-w-0 pb-1">
            <h2 className="text-xl font-bold uppercase tracking-tight text-adm-text truncate">
              {user?.name || "Anonymous Member"}
            </h2>
            <p className="text-sm text-adm-text-2 font-medium mt-0.5">
              {user?.title || "Staff Member // Technical Contributor"}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-adm-text-3">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-adm-text-3" />
                {user?.email}
              </span>
              {user?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-adm-text-3" />
                  {user.phone}
                </span>
              )}
              {user?.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-adm-text-3" />
                  {user.location}
                </span>
              )}
            </div>
          </div>

          {/* PP Quick Upload Buttons on Desktop */}
          <div className="flex items-center gap-2 sm:self-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatar.isPending}
              className="px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider border border-adm-border bg-adm-surface-2 hover:bg-adm-surface-3 text-adm-text-2 hover:text-adm-text transition flex items-center gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              {uploadAvatar.isPending ? "Uploading…" : "Change Photo"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: View Mode vs Edit Mode */}
      {!isEditing ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Contact & Social Info */}
          <div className="space-y-6">
            {/* Contact Details Card */}
            <div className="border border-adm-border bg-adm-surface p-5">
              <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-action mb-4 flex items-center gap-2">
                <User className="h-3.5 w-3.5" /> Contact Information
              </h3>
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-adm-text-3 block font-mono text-[10px] uppercase tracking-wider">
                    Email Address
                  </span>
                  <span className="font-medium text-adm-text break-all mt-0.5 block">
                    {user?.email || "—"}
                  </span>
                </div>

                <div>
                  <span className="text-adm-text-3 block font-mono text-[10px] uppercase tracking-wider">
                    Phone Number
                  </span>
                  <span className="font-medium text-adm-text mt-0.5 block">
                    {user?.phone || <em className="text-adm-text-3 not-italic">Not provided</em>}
                  </span>
                </div>

                <div>
                  <span className="text-adm-text-3 block font-mono text-[10px] uppercase tracking-wider">
                    Office / Location
                  </span>
                  <span className="font-medium text-adm-text mt-0.5 block">
                    {user?.location || <em className="text-adm-text-3 not-italic">Not provided</em>}
                  </span>
                </div>

                <div>
                  <span className="text-adm-text-3 block font-mono text-[10px] uppercase tracking-wider">
                    Emergency Contact
                  </span>
                  <span className="font-medium text-adm-text mt-0.5 block">
                    {user?.emergencyContact || (
                      <em className="text-adm-text-3 not-italic">No emergency contact recorded</em>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Public Links Card */}
            <div className="border border-adm-border bg-adm-surface p-5">
              <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-action mb-4 flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" /> Public Profiles
              </h3>
              <div className="space-y-3 text-xs">
                {user?.githubUrl ? (
                  <Link
                    href={user.githubUrl.startsWith("http") ? user.githubUrl : `https://${user.githubUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 border border-adm-border bg-adm-surface-2 hover:border-adm-blue text-adm-text transition group"
                  >
                    <span className="flex items-center gap-2 font-mono">
                      <FaGithub className="h-4 w-4 text-adm-text-2 group-hover:text-adm-text" /> GitHub
                    </span>
                    <ExternalLink className="h-3 w-3 text-adm-text-3 group-hover:text-adm-blue" />
                  </Link>
                ) : (
                  <p className="text-adm-text-3 text-xs">No GitHub profile linked.</p>
                )}

                {user?.linkedinUrl ? (
                  <Link
                    href={user.linkedinUrl.startsWith("http") ? user.linkedinUrl : `https://${user.linkedinUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 border border-adm-border bg-adm-surface-2 hover:border-adm-blue text-adm-text transition group"
                  >
                    <span className="flex items-center gap-2 font-mono">
                      <FaLinkedin className="h-4 w-4 text-adm-text-2 group-hover:text-adm-text" /> LinkedIn
                    </span>
                    <ExternalLink className="h-3 w-3 text-adm-text-3 group-hover:text-adm-blue" />
                  </Link>
                ) : (
                  <p className="text-adm-text-3 text-xs">No LinkedIn profile linked.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Bio, Skills, and Employment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About / Bio Card */}
            <div className="border border-adm-border bg-adm-surface p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-action flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" /> Professional Bio &amp; Summary
                </h3>
              </div>
              {user?.bio ? (
                <p className="text-sm text-adm-text-2 leading-relaxed whitespace-pre-wrap">
                  {user.bio}
                </p>
              ) : (
                <div className="border border-dashed border-adm-border p-6 text-center text-xs text-adm-text-3">
                  No professional biography added yet. Click &ldquo;Edit Profile&rdquo; to introduce your experience and background.
                </div>
              )}
            </div>

            {/* Core Competencies & Skills */}
            <div className="border border-adm-border bg-adm-surface p-6">
              <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-action mb-4 flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5" /> Core Competencies &amp; Skills
              </h3>
              {parsedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {parsedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs font-mono font-medium border border-adm-border bg-adm-surface-2 text-adm-text"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-adm-border p-6 text-center text-xs text-adm-text-3">
                  No skills listed yet. Add skills like &ldquo;Next.js, Python, PostgreSQL, Penetration Testing&rdquo; to highlight your expertise.
                </div>
              )}
            </div>

            {/* Organization & Employment Context */}
            <div className="border border-adm-border bg-adm-surface p-6">
              <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-action mb-4 flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" /> Organization &amp; Role
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 border border-adm-border bg-adm-surface-2">
                  <span className="text-adm-text-3 font-mono text-[10px] uppercase tracking-wider block">
                    Organization
                  </span>
                  <span className="font-bold text-adm-text text-sm mt-0.5 block">
                    Tauqeer Mustafa Inc.
                  </span>
                </div>

                <div className="p-3 border border-adm-border bg-adm-surface-2">
                  <span className="text-adm-text-3 font-mono text-[10px] uppercase tracking-wider block">
                    Role Category
                  </span>
                  <span className="font-bold text-adm-text text-sm mt-0.5 block uppercase">
                    {roleLabel(user?.role)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Profile Form */
        <form onSubmit={handleSaveProfile} className="border border-adm-border bg-adm-surface p-6 space-y-8">
          <div>
            <h3 className="text-base font-bold uppercase text-adm-text flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-action" /> Edit Personal &amp; Professional Information
            </h3>
            <p className="text-xs text-adm-text-3 mt-1">
              Update your public display information, profile picture, contact numbers, skills, and links.
            </p>
          </div>

          {/* Section 1: Profile Photo (PP) */}
          <div className="border-t border-adm-border pt-6">
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-adm-text mb-3">
              Profile Photo (PP)
            </h4>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative h-20 w-20 shrink-0 border border-adm-border bg-adm-surface-2 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center font-mono text-2xl font-bold text-adm-blue">
                    {name.charAt(0) || "U"}
                  </div>
                )}
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <PortalButton
                    type="button"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadAvatar.isPending}
                  >
                    <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload Image File
                  </PortalButton>
                  <PortalButton
                    type="button"
                    variant="ghost"
                    onClick={() => setIsUrlModalOpen(true)}
                  >
                    <Globe className="mr-1.5 h-3.5 w-3.5" /> Set Image URL
                  </PortalButton>
                  {avatarUrl && (
                    <PortalButton
                      type="button"
                      variant="danger"
                      onClick={handleRemoveAvatar}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove Photo
                    </PortalButton>
                  )}
                </div>
                <p className="text-[11px] text-adm-text-3">
                  Accepts JPG, PNG, WEBP, GIF up to 5MB. Square framing recommended.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Identity & Headline */}
          <div className="border-t border-adm-border pt-6 grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-adm-text-2 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={`${inputClass} text-sm`}
                placeholder="e.g. John Doe"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-adm-text-2 mb-1.5">
                Professional Title / Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`${inputClass} text-sm`}
                placeholder="e.g. Senior Security Engineer"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-adm-text-2 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`${inputClass} text-sm`}
                placeholder="e.g. +92 300 1234567"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-adm-text-2 mb-1.5">
                Office / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`${inputClass} text-sm`}
                placeholder="e.g. Islamabad, Pakistan (or Remote)"
              />
            </div>
          </div>

          {/* Section 3: Professional Bio */}
          <div className="border-t border-adm-border pt-6">
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-adm-text-2 mb-1.5">
              Professional Bio / Summary
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={`${inputClass} text-sm`}
              placeholder="Tell team members and clients about your background, architecture focus, and technical strengths…"
            />
          </div>

          {/* Section 4: Skills & Competencies */}
          <div className="border-t border-adm-border pt-6">
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-adm-text-2 mb-1.5">
              Technical Skills (Comma separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className={`${inputClass} text-sm`}
              placeholder="e.g. React, Next.js, Python, FastAPI, Docker, Kubernetes, Penetration Testing"
            />
            {skills && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {skills
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-[11px] font-mono border border-adm-border bg-adm-surface-2 text-adm-text-2"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Section 5: Public Links & Emergency Contact */}
          <div className="border-t border-adm-border pt-6 grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-adm-text-2 mb-1.5">
                GitHub Profile URL
              </label>
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className={`${inputClass} text-sm`}
                placeholder="https://github.com/username"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-adm-text-2 mb-1.5">
                LinkedIn Profile URL
              </label>
              <input
                type="text"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className={`${inputClass} text-sm`}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-adm-text-2 mb-1.5">
                Emergency Contact (HR Records)
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className={`${inputClass} text-sm`}
                placeholder="e.g. Spouse / Parent Name — +92 300 9876543"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-adm-border">
            <PortalButton type="button" variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </PortalButton>
            <PortalButton
              type="submit"
              variant="primary"
              disabled={updateProfile.isPending}
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              {updateProfile.isPending ? "Saving Changes…" : "Save Profile"}
            </PortalButton>
          </div>
        </form>
      )}

      {/* Set Photo by URL Modal */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-adm-border bg-adm-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-adm-text">
                Set Profile Picture by URL
              </h3>
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="text-adm-text-3 hover:text-adm-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-adm-text-2 mb-3">
              Enter a direct image URL (HTTPS) to use as your profile picture:
            </p>

            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className={`${inputClass} text-xs mb-4`}
              autoFocus
            />

            <div className="flex items-center justify-end gap-2">
              <PortalButton variant="ghost" onClick={() => setIsUrlModalOpen(false)}>
                Cancel
              </PortalButton>
              <PortalButton
                variant="primary"
                onClick={handleSetAvatarUrl}
                disabled={!urlInput.trim() || updateProfile.isPending}
              >
                Apply URL
              </PortalButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

