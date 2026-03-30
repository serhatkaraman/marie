"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditBlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);

  const fetchPost = useCallback(async () => {
    const res = await fetch(`/api/admin/blog?id=${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setPost(data.post);
    }
  }, [params.id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/admin/blog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: params.id,
        slug: fd.get("slug"),
        isPublished: fd.get("isPublished") === "on",
        translations: {
          tr: { title: fd.get("title_tr"), excerpt: fd.get("excerpt_tr") || "", content: fd.get("content_tr") || "" },
          en: { title: fd.get("title_en"), excerpt: fd.get("excerpt_en") || "", content: fd.get("content_en") || "" },
          fr: { title: fd.get("title_fr"), excerpt: fd.get("excerpt_fr") || "", content: fd.get("content_fr") || "" },
        },
      }),
    });
    router.push("/admin/blog");
  }

  if (!post) return <p className="text-muted text-sm">Loading...</p>;

  const getTrans = (locale: string) =>
    post.translations?.find((t: any) => t.locale === locale) || {};

  return (
    <div>
      <h1 className="text-2xl font-serif text-primary mb-6">Edit Blog Post</h1>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-border p-6 space-y-4">
        <div>
          <label className="block text-xs text-muted mb-1 uppercase tracking-wider">Slug</label>
          <input name="slug" defaultValue={post.slug} required className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="isPublished" id="isPublished" defaultChecked={post.isPublished} className="accent-accent" />
          <label htmlFor="isPublished" className="text-sm text-body">Published</label>
        </div>

        {["tr", "en", "fr"].map((locale) => (
          <div key={locale} className="border border-border rounded-lg p-4 space-y-3">
            <p className="text-xs font-medium text-muted uppercase tracking-wider">{locale.toUpperCase()}</p>
            <input name={`title_${locale}`} defaultValue={getTrans(locale).title || ""} required placeholder="Title" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            <input name={`excerpt_${locale}`} defaultValue={getTrans(locale).excerpt || ""} placeholder="Excerpt" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            <textarea name={`content_${locale}`} defaultValue={getTrans(locale).content || ""} placeholder="Content" rows={8} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent resize-y" />
          </div>
        ))}

        <button type="submit" className="bg-accent text-white text-sm px-6 py-2 rounded-lg hover:bg-accent/80 transition-colors">
          Save
        </button>
      </form>
    </div>
  );
}
