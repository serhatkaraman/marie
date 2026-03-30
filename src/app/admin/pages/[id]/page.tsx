"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditPagePage() {
  const params = useParams();
  const router = useRouter();
  const [page, setPage] = useState<any>(null);

  const fetchPage = useCallback(async () => {
    const res = await fetch(`/api/admin/pages?id=${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setPage(data.page);
    }
  }, [params.id]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/admin/pages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: params.id,
        slug: fd.get("slug"),
        template: fd.get("template"),
        isVisible: fd.get("isVisible") === "on",
        translations: {
          tr: { title: fd.get("title_tr"), content: fd.get("content_tr") || "" },
          en: { title: fd.get("title_en"), content: fd.get("content_en") || "" },
          fr: { title: fd.get("title_fr"), content: fd.get("content_fr") || "" },
        },
      }),
    });
    router.push("/admin/pages");
  }

  if (!page) return <p className="text-muted text-sm">Loading...</p>;

  const getTrans = (locale: string) =>
    page.translations?.find((t: any) => t.locale === locale) || {};

  return (
    <div>
      <h1 className="text-2xl font-serif text-primary mb-6">Edit Page</h1>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-border p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-wider">Slug</label>
            <input name="slug" defaultValue={page.slug} required className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-wider">Template</label>
            <select name="template" defaultValue={page.template} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent">
              <option value="default">Default</option>
              <option value="about">About</option>
              <option value="contact">Contact</option>
              <option value="print-sale">Print Sale</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="isVisible" id="isVisible" defaultChecked={page.isVisible} className="accent-accent" />
          <label htmlFor="isVisible" className="text-sm text-body">Visible</label>
        </div>

        {["tr", "en", "fr"].map((locale) => (
          <div key={locale} className="border border-border rounded-lg p-4 space-y-3">
            <p className="text-xs font-medium text-muted uppercase tracking-wider">{locale.toUpperCase()}</p>
            <div>
              <label className="block text-xs text-muted mb-1">Title</label>
              <input name={`title_${locale}`} defaultValue={getTrans(locale).title || ""} required className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Content</label>
              <textarea name={`content_${locale}`} defaultValue={getTrans(locale).content || ""} rows={8} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent resize-y" />
            </div>
          </div>
        ))}

        <button type="submit" className="bg-accent text-white text-sm px-6 py-2 rounded-lg hover:bg-accent/80 transition-colors">
          Save
        </button>
      </form>
    </div>
  );
}
