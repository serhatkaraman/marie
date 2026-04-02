"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const [gallery, setGallery] = useState<any>(null);
  const [allImages, setAllImages] = useState<any[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const [galRes, imgRes] = await Promise.all([
      fetch(`/api/admin/categories?galleryId=${params.id}`),
      fetch("/api/admin/photos"),
    ]);
    if (galRes.ok) {
      const data = await galRes.json();
      setGallery(data.gallery);
      setSelectedImageIds(
        data.gallery.images.map((gi: any) => gi.image.id)
      );
    }
    if (imgRes.ok) {
      const data = await imgRes.json();
      setAllImages(data.images);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function toggleImage(imageId: string) {
    setSelectedImageIds((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId]
    );
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);

    await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateGallery",
        galleryId: params.id,
        slug: fd.get("slug"),
        isVisible: fd.get("isVisible") === "on",
        translations: {
          tr: { title: fd.get("title_tr"), description: fd.get("desc_tr") || "" },
          en: { title: fd.get("title_en"), description: fd.get("desc_en") || "" },
          fr: { title: fd.get("title_fr"), description: fd.get("desc_fr") || "" },
        },
        imageIds: selectedImageIds,
      }),
    });

    setSaving(false);
    router.push(`/admin/categories/${gallery.categoryId}`);
  }

  async function handleDelete() {
    if (!confirm("Delete this gallery? This cannot be undone.")) return;
    await fetch(`/api/admin/categories?galleryId=${params.id}`, {
      method: "DELETE",
    });
    router.push(`/admin/categories/${gallery.categoryId}`);
  }

  if (!gallery) return <p className="text-muted text-sm">Loading...</p>;

  const getTrans = (locale: string) =>
    gallery.translations?.find((t: any) => t.locale === locale) || {};

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-serif text-primary">Edit Gallery</h1>
        <button
          onClick={handleDelete}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          Delete Gallery
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic info */}
        <div className="bg-white rounded-xl border border-border p-6 space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1 uppercase tracking-wider">Slug</label>
            <input
              name="slug"
              defaultValue={gallery.slug}
              required
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isVisible" id="isVisible" defaultChecked={gallery.isVisible} className="accent-accent" />
            <label htmlFor="isVisible" className="text-sm text-body">Visible</label>
          </div>
        </div>

        {/* Translations */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="text-sm font-medium text-primary mb-4">Translations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["tr", "en", "fr"].map((locale) => (
              <div key={locale} className="space-y-2">
                <p className="text-xs font-medium text-muted uppercase">{locale}</p>
                <input
                  name={`title_${locale}`}
                  defaultValue={getTrans(locale).title || ""}
                  required
                  placeholder="Title"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                />
                <input
                  name={`desc_${locale}`}
                  defaultValue={getTrans(locale).description || ""}
                  placeholder="Description"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-primary">
              Images ({selectedImageIds.length} selected)
            </h2>
          </div>

          {allImages.length === 0 ? (
            <p className="text-sm text-muted">No images uploaded yet. Go to Photos to upload images first.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 max-h-96 overflow-y-auto">
              {allImages.map((img) => {
                const isSelected = selectedImageIds.includes(img.id);
                const orderIndex = selectedImageIds.indexOf(img.id);
                return (
                  <div
                    key={img.id}
                    onClick={() => toggleImage(img.id)}
                    className={`relative aspect-square border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      isSelected ? "border-accent ring-2 ring-accent/30" : "border-border hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img.path.startsWith("http") ? img.path : img.path.startsWith("/") ? img.path : `/${img.path}`}
                      alt={img.alt || ""}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                        {orderIndex + 1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-accent text-white text-sm px-6 py-2 rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Gallery"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-muted hover:text-body transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
