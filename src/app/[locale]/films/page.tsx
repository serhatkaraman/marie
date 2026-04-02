export const dynamic = "force-dynamic";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";

export default async function FilmsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("films");

  const filmsCategory = await prisma.category.findUnique({
    where: { slug: "films" },
    include: {
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

  const allImages = filmsCategory?.galleries.flatMap((gal) =>
    gal.images.map((gi) => ({
      id: gi.image.id,
      src: gi.image.path.startsWith("http") ? gi.image.path : gi.image.path.startsWith("/") ? gi.image.path : `/${gi.image.path}`,
      alt: gi.image.alt || "Film",
      width: gi.image.width,
      height: gi.image.height,
      blurDataUrl: gi.image.blurDataUrl,
      title: gal.translations[0]?.title,
    }))
  ) || [];

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-3xl font-serif font-normal text-primary mb-8">
        {t("title")}
      </h1>
      {allImages.length > 0 ? (
        <GalleryGrid images={allImages} />
      ) : (
        <p className="text-muted text-sm">No films yet.</p>
      )}
    </div>
  );
}
