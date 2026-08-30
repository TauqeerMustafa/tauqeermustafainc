"use client";

import { useState } from "react";
import { Lock, Bell, Shield, Save } from "lucide-react";

export default function SettingsPage({ isAdmin = false }) {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full h-full min-h-[70vh]">
      <div>
        <h1 className="text-2xl font-bold uppercase" style={{ color: "var(--adm-text)" }}>{isAdmin ? "Portal Settings" : "My Settings"}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--adm-text-3)" }}>
          {isAdmin ? "Configure global portal preferences." : "Manage your password and notifications."}
        </p>
      </div>

      <div className="flex flex-col gap-8 mt-4">
        {/* Security */}
        <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-8">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="text-[var(--adm-blue)]" size={20} />
            <h2 className="text-lg font-bold uppercase text-[var(--adm-text)]">Security & Password</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">Current Password</label>
              <input type="password" placeholder="••••••••" className="w-full border border-[var(--adm-border)] px-4 py-2.5 outline-none" />
            </div>
            <div></div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full border border-[var(--adm-border)] px-4 py-2.5 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-[var(--adm-text-2)]">Confirm Password</label>
              <input type="password" placeholder="••••••••" className="w-full border border-[var(--adm-border)] px-4 py-2.5 outline-none" />
            </div>
          </div>
          <button className="flex items-center gap-2 bg-[var(--adm-blue)] px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
            <Save size={16} /> Update Password
          </button>
        </div>

        {/* Notifications */}
        <div className="border border-[var(--adm-border)] bg-[var(--adm-surface)] p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="text-[var(--adm-blue)]" size={20} />
            <h2 className="text-lg font-bold uppercase text-[var(--adm-text)]">Notification Preferences</h2>
          </div>
          <div className="flex flex-col gap-4">
            <label className="flex items-center justify-between p-4 border border-[var(--adm-border)] cursor-pointer hover:bg-[var(--adm-surface-2)] transition">
              <div>
                <p className="font-bold text-[var(--adm-text)]">Email Notifications</p>
                <p className="text-xs text-[var(--adm-text-3)]">Receive emails for task assignments and leave approvals.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5 accent-[var(--adm-blue)] cursor-pointer" />
            </label>
            <label className="flex items-center justify-between p-4 border border-[var(--adm-border)] cursor-pointer hover:bg-[var(--adm-surface-2)] transition">
              <div>
                <p className="font-bold text-[var(--adm-text)]">In-App Alerts</p>
                <p className="text-xs text-[var(--adm-text-3)]">Show bell icon notifications inside the portal.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-5 w-5 accent-[var(--adm-blue)] cursor-pointer" />
            </label>
          </div>
        </div>

        {/* Admin only */}
        {isAdmin && (
          <div className="border border-[var(--adm-red)] p-8" style={{ borderColor: "var(--adm-red)", background: "var(--adm-red-light)" }}>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-[var(--adm-red)]" size={20} />
              <h2 className="text-lg font-bold uppercase text-[var(--adm-red)]">Danger Zone</h2>
            </div>
            <p className="text-sm text-[var(--adm-red)] mb-4 font-medium">Global portal shutdown or maintenance mode. Use with extreme caution.</p>
            <button className="bg-[var(--adm-red)] px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
              Enable Maintenance Mode
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
