export const dynamic = "force-dynamic";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { translations: { where: { locale } } },
  });

  if (!post || !post.isPublished) {
    notFound();
  }

  const translation = post.translations[0];
  if (!translation) {
    notFound();
  }

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <div className="mb-6">
        <Link
          href={`/${locale}/blog`}
          className="text-xs text-muted hover:text-accent transition-colors tracking-wider uppercase"
        >
          &larr; Blog
        </Link>
      </div>

      <article>
        <h1 className="text-3xl font-serif font-normal text-primary mb-3">
          {translation.title}
        </h1>
        {post.publishedAt && (
          <time className="text-xs text-muted tracking-wide block mb-8">
            {new Intl.DateTimeFormat(locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            }).format(post.publishedAt)}
          </time>
        )}
        <div className="prose prose-sm max-w-none text-body leading-relaxed whitespace-pre-line">
          {translation.content}
        </div>
      </article>
    </div>
  );
}
