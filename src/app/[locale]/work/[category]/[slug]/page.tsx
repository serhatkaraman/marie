export const dynamic = "force-dynamic";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import Link from "next/link";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}) {
  const { locale, category, slug } = await params;
  setRequestLocale(locale);

  const gallery = await prisma.gallery.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale } },
      category: {
        include: { translations: { where: { locale } } },
      },
      images: {
        orderBy: { sortOrder: "asc" },
        include: { image: true },
      },
    },
  });

  if (!gallery || !gallery.isVisible) {
    notFound();
  }

  const galleryTitle = gallery.translations[0]?.title || gallery.slug;
  const galleryDescription = gallery.translations[0]?.description;
  const categoryName = gallery.category.translations[0]?.name || category;

  const images = gallery.images.map((gi) => ({
    id: gi.image.id,
    src: gi.image.path.startsWith("http") ? gi.image.path : gi.image.path.startsWith("/") ? gi.image.path : `/${gi.image.path}`,
    alt: gi.image.alt || galleryTitle,
    width: gi.image.width,
    height: gi.image.height,
    blurDataUrl: gi.image.blurDataUrl,
  }));

  return (
    <div className="p-6 lg:p-10">
      {/* Breadcrumb */}
      <div className="mb-6 text-xs text-muted tracking-wide">
        <Link
          href={`/${locale}/work/${category}`}
          className="hover:text-accent transition-colors"
        >
          {categoryName}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-body">{galleryTitle}</span>
      </div>

      <h1 className="text-3xl font-serif font-normal text-primary mb-2">
        {galleryTitle}
      </h1>
      {galleryDescription && (
        <p className="text-muted text-sm mb-8 max-w-2xl">{galleryDescription}</p>
      )}

      {images.length > 0 ? (
        <GalleryGrid images={images} />
      ) : (
        <p className="text-muted text-sm">No images yet.</p>
      )}
    </div>
  );
}
