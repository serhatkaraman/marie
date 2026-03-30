export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const [photoCount, categoryCount, galleryCount, messageCount, unreadCount, blogCount] =
    await Promise.all([
      prisma.image.count(),
      prisma.category.count(),
      prisma.gallery.count(),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.blogPost.count(),
    ]);

  const stats = [
    { label: "Photos", value: photoCount, href: "/admin/photos" },
    { label: "Categories", value: categoryCount, href: "/admin/categories" },
    { label: "Galleries", value: galleryCount, href: "/admin/categories" },
    { label: "Blog Posts", value: blogCount, href: "/admin/blog" },
    { label: "Messages", value: messageCount, href: "/admin/messages", badge: unreadCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-serif text-primary mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl p-6 border border-border hover:border-accent/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">{stat.label}</p>
              {stat.badge ? (
                <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                  {stat.badge} new
                </span>
              ) : null}
            </div>
            <p className="text-3xl font-serif text-primary mt-2">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-border">
          <h2 className="text-lg font-serif text-primary mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              href="/admin/photos"
              className="block p-3 rounded-lg hover:bg-gray-50 text-sm text-body transition-colors"
            >
              Upload Photos
            </Link>
            <Link
              href="/admin/categories"
              className="block p-3 rounded-lg hover:bg-gray-50 text-sm text-body transition-colors"
            >
              Manage Categories & Galleries
            </Link>
            <Link
              href="/admin/pages"
              className="block p-3 rounded-lg hover:bg-gray-50 text-sm text-body transition-colors"
            >
              Edit Page Content
            </Link>
            <Link
              href="/admin/blog/new"
              className="block p-3 rounded-lg hover:bg-gray-50 text-sm text-body transition-colors"
            >
              Create Blog Post
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
