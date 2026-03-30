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
    const category = await prisma.category.findUnique({
      where: { id },
      include: { translations: true },
    });
    const galleries = await prisma.gallery.findMany({
      where: { categoryId: id },
      orderBy: { sortOrder: "asc" },
      include: {
        translations: true,
        _count: { select: { images: true } },
      },
    });
    return NextResponse.json({ category, galleries });
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      translations: true,
      _count: { select: { galleries: true } },
    },
  });

  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Create gallery within a category
  if (body.action === "createGallery") {
    const { categoryId, slug, translations, imageIds } = body;
    const maxOrder = await prisma.gallery.aggregate({
      where: { categoryId },
      _max: { sortOrder: true },
    });
    const nextOrder = (maxOrder._max.sortOrder || 0) + 1;

    const gallery = await prisma.gallery.create({
      data: {
        slug,
        categoryId,
        sortOrder: nextOrder,
        publishedAt: new Date(),
        translations: {
          create: Object.entries(translations).map(([locale, trans]: [string, any]) => ({
            locale,
            title: trans.title,
            description: trans.description || null,
          })),
        },
        images: {
          create: (imageIds || []).map((imageId: string, index: number) => ({
            imageId,
            sortOrder: index,
          })),
        },
      },
    });

    return NextResponse.json({ gallery });
  }

  // Create category
  const { slug, translations } = body;
  const maxOrder = await prisma.category.aggregate({ _max: { sortOrder: true } });
  const nextOrder = (maxOrder._max.sortOrder || 0) + 1;

  const category = await prisma.category.create({
    data: {
      slug,
      sortOrder: nextOrder,
      translations: {
        create: Object.entries(translations).map(([locale, trans]: [string, any]) => ({
          locale,
          name: trans.name,
          description: trans.description || null,
        })),
      },
    },
    include: { translations: true },
  });

  return NextResponse.json({ category });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, slug, isVisible, sortOrder, translations } = body;

  await prisma.category.update({
    where: { id },
    data: {
      slug,
      isVisible,
      sortOrder,
    },
  });

  if (translations) {
    for (const [locale, trans] of Object.entries(translations) as [string, any][]) {
      await prisma.categoryTranslation.upsert({
        where: { categoryId_locale: { categoryId: id, locale } },
        update: { name: trans.name, description: trans.description },
        create: { categoryId: id, locale, name: trans.name, description: trans.description },
      });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
