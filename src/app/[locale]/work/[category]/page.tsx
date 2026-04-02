export const dynamic = "force-dynamic";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import Link from "next/link";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  setRequestLocale(locale);

  const cat = await prisma.category.findUnique({
    where: { slug: category },
    include: {
      translations: { where: { locale } },
      galleries: {
        where: { isVisible: true },
        orderBy: { sortOrder: "asc" },
        include: {
          translations: { where: { locale } },
          images: {
            orderBy: { sortOrder: "asc" },
            include: { image: true },
          },
        },
      },
    },
  });

  if (!cat || !cat.isVisible) {
    notFound();
  }

  const categoryName = cat.translations[0]?.name || cat.slug;

  // If category has multiple galleries, show gallery listing
  if (cat.galleries.length > 1) {
    return (
      <div className="p-6 lg:p-10">
        <h1 className="text-3xl font-serif font-normal text-primary mb-8">
          {categoryName}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cat.galleries.map((gallery) => {
            const coverImage = gallery.images[0]?.image;
            const galleryTitle = gallery.translations[0]?.title || gallery.slug;
            return (
              <Link
                key={gallery.id}
                href={`/${locale}/work/${category}/${gallery.slug}`}
                className="group block"
              >
                {coverImage && (
                  <div className="relative aspect-[4/3] overflow-hidden mb-3">
                    <img
                      src={coverImage.path.startsWith("http") ? coverImage.path : coverImage.path.startsWith("/") ? coverImage.path : `/${coverImage.path}`}
                      alt={galleryTitle}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                )}
                <h3 className="text-sm tracking-wide text-body group-hover:text-accent transition-colors">
                  {galleryTitle}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // If single gallery or no galleries, show all images
  const allImages = cat.galleries.flatMap((gal) =>
    gal.images.map((gi) => ({
      id: gi.image.id,
      src: gi.image.path.startsWith("http") ? gi.image.path : gi.image.path.startsWith("/") ? gi.image.path : `/${gi.image.path}`,
      alt: gi.image.alt || categoryName,
      width: gi.image.width,
      height: gi.image.height,
      blurDataUrl: gi.image.blurDataUrl,
    }))
  );

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-3xl font-serif font-normal text-primary mb-8">
        {categoryName}
      </h1>
      {allImages.length > 0 ? (
        <GalleryGrid images={allImages} />
      ) : (
        <p className="text-muted text-sm">No images yet.</p>
      )}
    </div>
  );
}
