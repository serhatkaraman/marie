"use client";

import { useState, useEffect, useCallback } from "react";

interface ImageData {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  width: number;
  height: number;
  createdAt: string;
}

export default function PhotosPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fetchImages = useCallback(async () => {
    const res = await fetch("/api/admin/photos");
    if (res.ok) {
      const data = await res.json();
      setImages(data.images);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  async function handleUpload(files: FileList) {
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      await fetch("/api/upload", { method: "POST", body: formData });
    }
    setUploading(false);
    fetchImages();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this photo?")) return;
    await fetch(`/api/admin/photos?id=${id}`, { method: "DELETE" });
    fetchImages();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-primary">Photos</h1>
      </div>

      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center mb-8 transition-colors ${
          dragActive ? "border-accent bg-accent/5" : "border-border"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
        }}
      >
        <p className="text-muted text-sm mb-3">
          {uploading ? "Uploading..." : "Drag & drop photos here or"}
        </p>
        <label className="inline-block cursor-pointer text-sm bg-primary text-white px-6 py-2 rounded-lg hover:bg-body transition-colors">
          Browse Files
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative bg-white rounded-lg border border-border overflow-hidden"
          >
            <div className="aspect-square">
              <img
                src={img.path}
                alt={img.originalName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
              <button
                onClick={() => handleDelete(img.id)}
                className="opacity-0 group-hover:opacity-100 bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg transition-opacity"
              >
                Delete
              </button>
            </div>
            <div className="p-2">
              <p className="text-xs text-muted truncate">{img.originalName}</p>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && !uploading && (
        <p className="text-center text-muted text-sm py-10">
          No photos uploaded yet.
        </p>
      )}
    </div>
  );
}
