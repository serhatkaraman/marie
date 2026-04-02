"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<any>(null);
  const [galleries, setGalleries] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [showGalleryForm, setShowGalleryForm] = useState(false);

  const fetchData = useCallback(async () => {
    const [catRes, imgRes] = await Promise.all([
      fetch(`/api/admin/categories?id=${params.id}`),
      fetch("/api/admin/photos"),
    ]);
    if (catRes.ok) {
      const data = await catRes.json();
      setCategory(data.category);
      setGalleries(data.galleries || []);
    }
    if (imgRes.ok) {
      const data = await imgRes.json();
      setImages(data.images);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: params.id,
        slug: fd.get("slug"),
        isVisible: fd.get("isVisible") === "on",
        translations: {
          tr: { name: fd.get("name_tr"), description: fd.get("desc_tr") || "" },
          en: { name: fd.get("name_en"), description: fd.get("desc_en") || "" },
          fr: { name: fd.get("name_fr"), description: fd.get("desc_fr") || "" },
        },
      }),
    });
    router.push("/admin/categories");
  }

  async function handleCreateGallery(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const selectedImages = fd.getAll("images") as string[];
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "createGallery",
        categoryId: params.id,
        slug: fd.get("gallery_slug"),
        translations: {
          tr: { title: fd.get("gallery_title_tr"), description: "" },
          en: { title: fd.get("gallery_title_en"), description: "" },
          fr: { title: fd.get("gallery_title_fr"), description: "" },
        },
        imageIds: selectedImages,
      }),
    });
    setShowGalleryForm(false);
    fetchData();
  }

  if (!category) return <p className="text-muted text-sm">Loading...</p>;

  const getTrans = (locale: string) =>
    category.translations?.find((t: any) => t.locale === locale) || {};

  return (
    <div>
      <h1 className="text-2xl font-serif text-primary mb-6">Edit Category</h1>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-border p-6 mb-8 space-y-4">
        <div>
          <label className="block text-xs text-muted mb-1 uppercase tracking-wider">Slug</label>
          <input name="slug" defaultValue={category.slug} required className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="isVisible" id="isVisible" defaultChecked={category.isVisible} className="accent-accent" />
          <label htmlFor="isVisible" className="text-sm text-body">Visible</label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {["tr", "en", "fr"].map((locale) => (
            <div key={locale} className="space-y-2">
              <p className="text-xs font-medium text-muted uppercase">{locale}</p>
              <input name={`name_${locale}`} defaultValue={getTrans(locale).name || ""} required placeholder="Name" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
              <input name={`desc_${locale}`} defaultValue={getTrans(locale).description || ""} placeholder="Description" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
          ))}
        </div>
        <button type="submit" className="bg-accent text-white text-sm px-6 py-2 rounded-lg hover:bg-accent/80 transition-colors">
          Save
        </button>
      </form>

      {/* Galleries section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif text-primary">Galleries</h2>
        <button
          onClick={() => setShowGalleryForm(!showGalleryForm)}
          className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-body transition-colors"
        >
          {showGalleryForm ? "Cancel" : "New Gallery"}
        </button>
      </div>

      {showGalleryForm && (
        <form onSubmit={handleCreateGallery} className="bg-white rounded-xl border border-border p-6 mb-6 space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-wider">Gallery Slug</label>
            <input name="gallery_slug" required className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["tr", "en", "fr"].map((locale) => (
              <div key={locale}>
                <p className="text-xs font-medium text-muted uppercase mb-1">{locale}</p>
                <input name={`gallery_title_${locale}`} required placeholder="Title" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs text-muted mb-2 uppercase tracking-wider">Select Images</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 max-h-60 overflow-y-auto">
              {images.map((img) => (
                <label key={img.id} className="cursor-pointer">
                  <input type="checkbox" name="images" value={img.id} className="hidden peer" />
                  <div className="aspect-square border-2 border-border peer-checked:border-accent rounded-lg overflow-hidden">
                    <img src={img.path} alt="" className="w-full h-full object-cover" />
                  </div>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="bg-accent text-white text-sm px-6 py-2 rounded-lg hover:bg-accent/80 transition-colors">
            Create Gallery
          </button>
        </form>
      )}

      <div className="space-y-3">
        {galleries.map((gal: any) => (
          <div key={gal.id} className="bg-white rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-medium text-primary">
                {gal.translations?.find((t: any) => t.locale === "en")?.title || gal.slug}
              </h3>
              <p className="text-xs text-muted">{gal._count?.images || 0} images &middot; /{gal.slug}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/galleries/${gal.id}`}
                className="text-xs text-accent hover:underline"
              >
                Edit
              </Link>
              <button
                onClick={async () => {
                  if (!confirm("Delete this gallery?")) return;
                  await fetch(`/api/admin/categories?galleryId=${gal.id}`, { method: "DELETE" });
                  fetchData();
                }}
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
