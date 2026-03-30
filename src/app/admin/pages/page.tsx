"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface PageData {
  id: string;
  slug: string;
  template: string;
  isVisible: boolean;
  translations: { locale: string; title: string; content: string }[];
}

export default function PagesManagement() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [showForm, setShowForm] = useState(false);

  const fetchPages = useCallback(async () => {
    const res = await fetch("/api/admin/pages");
    if (res.ok) {
      const data = await res.json();
      setPages(data.pages);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/admin/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: fd.get("slug"),
        template: fd.get("template") || "default",
        translations: {
          tr: { title: fd.get("title_tr"), content: fd.get("content_tr") || "" },
          en: { title: fd.get("title_en"), content: fd.get("content_en") || "" },
          fr: { title: fd.get("title_fr"), content: fd.get("content_fr") || "" },
        },
      }),
    });
    setShowForm(false);
    fetchPages();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-primary">Pages</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-body transition-colors"
        >
          {showForm ? "Cancel" : "New Page"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-border p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1 uppercase tracking-wider">Slug</label>
              <input name="slug" required className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1 uppercase tracking-wider">Template</label>
              <select name="template" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent">
                <option value="default">Default</option>
                <option value="about">About</option>
                <option value="contact">Contact</option>
                <option value="print-sale">Print Sale</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {["tr", "en", "fr"].map((locale) => (
              <div key={locale} className="space-y-2">
                <p className="text-xs font-medium text-muted uppercase">{locale}</p>
                <input name={`title_${locale}`} required placeholder="Title" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
                <textarea name={`content_${locale}`} placeholder="Content" rows={4} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent resize-none" />
              </div>
            ))}
          </div>
          <button type="submit" className="bg-accent text-white text-sm px-6 py-2 rounded-lg">Create</button>
        </form>
      )}

      <div className="space-y-3">
        {pages.map((page) => (
          <div key={page.id} className="bg-white rounded-xl border border-border p-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-primary">
                {page.translations.find((t) => t.locale === "en")?.title || page.slug}
              </h3>
              <p className="text-xs text-muted">/{page.slug} &middot; {page.template}</p>
            </div>
            <Link href={`/admin/pages/${page.id}`} className="text-xs text-accent hover:underline">
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
