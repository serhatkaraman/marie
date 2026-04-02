"use client";

import { useState, useEffect, useCallback } from "react";

interface SettingData {
  id: string;
  key: string;
  value: string;
}

const settingFields = [
  { key: "site_title", label: "Site Title", type: "text" },
  { key: "site_description", label: "Site Description", type: "text" },
  { key: "contact_email", label: "Contact Email", type: "email" },
  { key: "instagram_url", label: "Instagram URL", type: "url" },
  { key: "hero_text", label: "Hero Text", type: "text" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/admin/settings");
    if (res.ok) {
      const data = await res.json();
      const map: Record<string, string> = {};
      data.settings.forEach((s: SettingData) => { map[s.key] = s.value; });
      setSettings(map);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const updates: Record<string, string> = {};
    settingFields.forEach((field) => {
      updates[field.key] = fd.get(field.key) as string;
    });

    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: updates }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwSaving(true);
    setPwMessage(null);
    const fd = new FormData(e.currentTarget);
    const currentPassword = fd.get("currentPassword") as string;
    const newPassword = fd.get("newPassword") as string;
    const confirmPassword = fd.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setPwMessage({ type: "error", text: "New passwords do not match" });
      setPwSaving(false);
      return;
    }

    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "changePassword", currentPassword, newPassword }),
    });

    if (res.ok) {
      setPwMessage({ type: "success", text: "Password changed successfully!" });
      e.currentTarget.reset();
    } else {
      const data = await res.json();
      setPwMessage({ type: "error", text: data.error || "Failed to change password" });
    }
    setPwSaving(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-serif text-primary mb-6">Settings</h1>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-border p-6 space-y-5 max-w-2xl">
        {settingFields.map((field) => (
          <div key={field.key}>
            <label className="block text-xs text-muted mb-1 uppercase tracking-wider">
              {field.label}
            </label>
            <input
              name={field.key}
              type={field.type}
              defaultValue={settings[field.key] || ""}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
        ))}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-accent text-white text-sm px-6 py-2 rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </form>

      <h2 className="text-xl font-serif text-primary mt-10 mb-4">Change Password</h2>

      <form onSubmit={handlePasswordChange} className="bg-white rounded-xl border border-border p-6 space-y-5 max-w-2xl">
        <div>
          <label className="block text-xs text-muted mb-1 uppercase tracking-wider">Current Password</label>
          <input name="currentPassword" type="password" required className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1 uppercase tracking-wider">New Password</label>
          <input name="newPassword" type="password" required minLength={6} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1 uppercase tracking-wider">Confirm New Password</label>
          <input name="confirmPassword" type="password" required minLength={6} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={pwSaving} className="bg-accent text-white text-sm px-6 py-2 rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50">
            {pwSaving ? "Changing..." : "Change Password"}
          </button>
          {pwMessage && (
            <span className={`text-sm ${pwMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {pwMessage.text}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
