export const dynamic = "force-dynamic";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");

  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    include: {
      translations: { where: { locale } },
    },
  });

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <h1 className="text-3xl font-serif font-normal text-primary mb-8">
        {t("title")}
      </h1>
      {posts.length === 0 ? (
        <p className="text-muted text-sm">{t("noPosts")}</p>
      ) : (
        <div className="space-y-10">
          {posts.map((post) => {
            const translation = post.translations[0];
            if (!translation) return null;
            return (
              <article key={post.id} className="border-b border-border pb-8">
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="group block"
                >
                  <h2 className="text-xl font-serif text-primary group-hover:text-accent transition-colors mb-2">
                    {translation.title}
                  </h2>
                  {post.publishedAt && (
                    <time className="text-xs text-muted tracking-wide">
                      {new Intl.DateTimeFormat(locale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }).format(post.publishedAt)}
                    </time>
                  )}
                  {translation.excerpt && (
                    <p className="text-sm text-body mt-3 leading-relaxed">
                      {translation.excerpt}
                    </p>
                  )}
                  <span className="inline-block mt-3 text-xs tracking-wider text-accent uppercase">
                    {t("readMore")}
                  </span>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
