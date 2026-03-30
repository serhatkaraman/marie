export const dynamic = "force-dynamic";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  const categories = await prisma.category.findMany({
    where: { isVisible: true },
    orderBy: { sortOrder: "asc" },
    include: {
      translations: { where: { locale } },
      galleries: {
        where: { isVisible: true },
        take: 1,
        include: {
          images: {
            take: 1,
            orderBy: { sortOrder: "asc" },
            include: { image: true },
          },
        },
      },
    },
  });

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-3xl font-serif font-normal text-primary mb-8">
        {t("work")}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {categories.map((cat) => {
          const coverImage = cat.galleries[0]?.images[0]?.image;
          const name = cat.translations[0]?.name || cat.slug;
          return (
            <Link
              key={cat.id}
              href={`/${locale}/work/${cat.slug}`}
              className="group block"
            >
              {coverImage ? (
                <div className="relative aspect-[3/2] overflow-hidden mb-4">
                  <img
                    src={coverImage.path.startsWith("/") ? coverImage.path : `/${coverImage.path}`}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
              ) : (
                <div className="aspect-[3/2] bg-gray-100 mb-4 flex items-center justify-center">
                  <span className="text-muted text-sm">No cover image</span>
                </div>
              )}
              <h2 className="text-lg font-serif text-primary group-hover:text-accent transition-colors">
                {name}
              </h2>
              {cat.translations[0]?.description && (
                <p className="text-sm text-muted mt-1">{cat.translations[0].description}</p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
