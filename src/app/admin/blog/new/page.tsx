"use client";

import { useRouter } from "next/navigation";

export default function NewBlogPostPage() {
  const router = useRouter();

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: fd.get("slug"),
        translations: {
          tr: { title: fd.get("title_tr"), excerpt: fd.get("excerpt_tr") || "", content: fd.get("content_tr") || "" },
          en: { title: fd.get("title_en"), excerpt: fd.get("excerpt_en") || "", content: fd.get("content_en") || "" },
          fr: { title: fd.get("title_fr"), excerpt: fd.get("excerpt_fr") || "", content: fd.get("content_fr") || "" },
        },
      }),
    });
    if (res.ok) {
      router.push("/admin/blog");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-serif text-primary mb-6">New Blog Post</h1>

      <form onSubmit={handleCreate} className="bg-white rounded-xl border border-border p-6 space-y-4">
        <div>
          <label className="block text-xs text-muted mb-1 uppercase tracking-wider">Slug</label>
          <input name="slug" required className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" placeholder="my-blog-post" />
        </div>

        {["tr", "en", "fr"].map((locale) => (
          <div key={locale} className="border border-border rounded-lg p-4 space-y-3">
            <p className="text-xs font-medium text-muted uppercase tracking-wider">{locale.toUpperCase()}</p>
            <input name={`title_${locale}`} required placeholder="Title" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            <input name={`excerpt_${locale}`} placeholder="Excerpt (optional)" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            <textarea name={`content_${locale}`} placeholder="Content" rows={8} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent resize-y" />
          </div>
        ))}

        <button type="submit" className="bg-accent text-white text-sm px-6 py-2 rounded-lg hover:bg-accent/80 transition-colors">
          Create Post
        </button>
      </form>
    </div>
  );
}
