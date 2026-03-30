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
    </div>
  );
}
