"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface BlogPostData {
  id: string;
  slug: string;
  isPublished: boolean;
  publishedAt: string | null;
  translations: { locale: string; title: string }[];
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostData[]>([]);

  const fetchPosts = useCallback(async () => {
    const res = await fetch("/api/admin/blog");
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this blog post?")) return;
    await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
    fetchPosts();
  }

  async function handleTogglePublish(id: string, isPublished: boolean) {
    await fetch("/api/admin/blog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isPublished: !isPublished }),
    });
    fetchPosts();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-primary">Blog Posts</h1>
        <Link
          href="/admin/blog/new"
          className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-body transition-colors"
        >
          New Post
        </Link>
      </div>

      <div className="space-y-3">
        {posts.length === 0 ? (
          <p className="text-muted text-sm">No blog posts yet.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl border border-border p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-primary">
                  {post.translations.find((t) => t.locale === "en")?.title || post.slug}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted">/{post.slug}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${post.isPublished ? "bg-green-50 text-green-600" : "bg-gray-50 text-muted"}`}>
                    {post.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleTogglePublish(post.id, post.isPublished)}
                  className="text-xs text-accent hover:underline"
                >
                  {post.isPublished ? "Unpublish" : "Publish"}
                </button>
                <Link href={`/admin/blog/${post.id}`} className="text-xs text-accent hover:underline">
                  Edit
                </Link>
                <button onClick={() => handleDelete(post.id)} className="text-xs text-red-500 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
