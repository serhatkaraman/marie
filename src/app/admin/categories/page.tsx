"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Category {
  id: string;
  slug: string;
  sortOrder: number;
  isVisible: boolean;
  translations: { locale: string; name: string; description: string | null }[];
  _count: { galleries: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/admin/categories");
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: fd.get("slug"),
        translations: {
          tr: { name: fd.get("name_tr"), description: fd.get("desc_tr") || "" },
          en: { name: fd.get("name_en"), description: fd.get("desc_en") || "" },
          fr: { name: fd.get("name_fr"), description: fd.get("desc_fr") || "" },
        },
      }),
    });
    setShowForm(false);
    fetchCategories();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category and all its galleries?")) return;
    await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
    fetchCategories();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-primary">Categories</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-body transition-colors"
        >
          {showForm ? "Cancel" : "New Category"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-border p-6 mb-6 space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-wider">Slug</label>
            <input name="slug" required className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" placeholder="e.g. landscape" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["tr", "en", "fr"].map((locale) => (
              <div key={locale} className="space-y-2">
                <p className="text-xs font-medium text-muted uppercase">{locale}</p>
                <input name={`name_${locale}`} required placeholder="Name" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
                <input name={`desc_${locale}`} placeholder="Description" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
              </div>
            ))}
          </div>
          <button type="submit" className="bg-accent text-white text-sm px-6 py-2 rounded-lg hover:bg-accent/80 transition-colors">
            Create
          </button>
        </form>
      )}

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium text-primary">
                  {cat.translations.find((t) => t.locale === "en")?.name || cat.slug}
                </h3>
                <span className="text-xs text-muted">/{cat.slug}</span>
                {!cat.isVisible && (
                  <span className="text-xs bg-gray-100 text-muted px-2 py-0.5 rounded">Hidden</span>
                )}
              </div>
              <p className="text-xs text-muted mt-1">
                {cat._count.galleries} galleries
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/categories/${cat.id}`}
                className="text-xs text-accent hover:underline"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-xs text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
