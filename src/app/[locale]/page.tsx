export const dynamic = "force-dynamic";

import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import Link from "next/link";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch all visible categories with their galleries and images
  const categories = await prisma.category.findMany({
    where: { isVisible: true },
    orderBy: { sortOrder: "asc" },
    include: {
      translations: { where: { locale } },
      galleries: {
        where: { isVisible: true },
        orderBy: { sortOrder: "asc" },
        take: 1,
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 4,
            include: { image: true },
          },
        },
      },
    },
  });

  // Collect featured images from galleries
  const featuredImages = categories.flatMap((cat) =>
    cat.galleries.flatMap((gal) =>
      gal.images.map((gi) => ({
        id: gi.image.id,
        src: gi.image.path.startsWith("/") ? gi.image.path : `/${gi.image.path}`,
        alt: gi.image.alt || cat.translations[0]?.name || "",
        width: gi.image.width,
        height: gi.image.height,
        blurDataUrl: gi.image.blurDataUrl,
        title: cat.translations[0]?.name,
      }))
    )
  );

  const hasImages = featuredImages.length > 0;

  return (
    <div className="min-h-screen">
      {hasImages ? (
        <div className="p-6 lg:p-10">
          <GalleryGrid images={featuredImages} />
        </div>
      ) : (
        /* Hero when no images uploaded yet */
        <div className="flex items-center justify-center min-h-screen px-6">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-serif font-normal text-primary mb-4 tracking-wide">
              Marie Meister
            </h1>
            <p className="text-muted text-sm tracking-[0.3em] uppercase">
              Photography
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${locale}/work/${cat.slug}`}
                  className="text-sm text-body hover:text-accent transition-colors tracking-wide"
                >
                  {cat.translations[0]?.name || cat.slug}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
