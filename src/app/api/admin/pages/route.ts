import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const page = await prisma.page.findUnique({
      where: { id },
      include: { translations: true },
    });
    return NextResponse.json({ page });
  }

  const pages = await prisma.page.findMany({
    orderBy: { createdAt: "asc" },
    include: { translations: true },
  });

  return NextResponse.json({ pages });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { slug, template, translations } = body;

  const page = await prisma.page.create({
    data: {
      slug,
      template: template || "default",
      translations: {
        create: Object.entries(translations).map(([locale, trans]: [string, any]) => ({
          locale,
          title: trans.title,
          content: trans.content || "",
        })),
      },
    },
  });

  return NextResponse.json({ page });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, slug, template, isVisible, translations } = body;

  await prisma.page.update({
    where: { id },
    data: { slug, template, isVisible },
  });

  if (translations) {
    for (const [locale, trans] of Object.entries(translations) as [string, any][]) {
      await prisma.pageTranslation.upsert({
        where: { pageId_locale: { pageId: id, locale } },
        update: { title: trans.title, content: trans.content },
        create: { pageId: id, locale, title: trans.title, content: trans.content },
      });
    }
  }

  return NextResponse.json({ success: true });
}
