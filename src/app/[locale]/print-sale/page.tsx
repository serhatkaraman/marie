export const dynamic = "force-dynamic";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";

export default async function PrintSalePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = await prisma.page.findUnique({
    where: { slug: "print-sale" },
    include: { translations: { where: { locale } } },
  });

  const title = page?.translations[0]?.title || "Print Sale";
  const content = page?.translations[0]?.content || "";

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <h1 className="text-3xl font-serif font-normal text-primary mb-8">
        {title}
      </h1>
      <div className="prose prose-sm max-w-none text-body leading-relaxed whitespace-pre-line">
        {content}
      </div>
    </div>
  );
}
