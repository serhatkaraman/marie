"use client";

import { useState, useEffect, useCallback } from "react";

interface MenuItemData {
  id: string;
  type: string;
  sortOrder: number;
  isVisible: boolean;
  url: string | null;
  translations: { locale: string; label: string }[];
}

export default function MenusPage() {
  const [items, setItems] = useState<MenuItemData[]>([]);
  const [showForm, setShowForm] = useState(false);

  const fetchMenus = useCallback(async () => {
    const res = await fetch("/api/admin/menus");
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/admin/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: fd.get("type"),
        url: fd.get("url") || null,
        translations: {
          tr: fd.get("label_tr"),
          en: fd.get("label_en"),
          fr: fd.get("label_fr"),
        },
      }),
    });
    setShowForm(false);
    fetchMenus();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this menu item?")) return;
    await fetch(`/api/admin/menus?id=${id}`, { method: "DELETE" });
    fetchMenus();
  }

  async function handleToggleVisibility(id: string, currentVisible: boolean) {
    await fetch("/api/admin/menus", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isVisible: !currentVisible }),
    });
    fetchMenus();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-primary">Menu Items</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-body transition-colors"
        >
          {showForm ? "Cancel" : "New Item"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-border p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1 uppercase tracking-wider">Type</label>
              <select name="type" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent">
                <option value="page">Page</option>
                <option value="category">Category</option>
                <option value="external">External Link</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1 uppercase tracking-wider">URL (external)</label>
              <input name="url" placeholder="https://..." className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {["tr", "en", "fr"].map((locale) => (
              <div key={locale}>
                <label className="block text-xs text-muted mb-1 uppercase tracking-wider">{locale} Label</label>
                <input name={`label_${locale}`} required className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
              </div>
            ))}
          </div>
          <button type="submit" className="bg-accent text-white text-sm px-6 py-2 rounded-lg">Create</button>
        </form>
      )}

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted w-6">{index + 1}</span>
              <div>
                <p className="text-sm font-medium text-primary">
                  {item.translations.find((t) => t.locale === "en")?.label || "Untitled"}
                </p>
                <p className="text-xs text-muted">{item.type}{item.url ? ` - ${item.url}` : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggleVisibility(item.id, item.isVisible)}
                className={`text-xs ${item.isVisible ? "text-green-600" : "text-muted"}`}
              >
                {item.isVisible ? "Visible" : "Hidden"}
              </button>
              <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:underline">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
