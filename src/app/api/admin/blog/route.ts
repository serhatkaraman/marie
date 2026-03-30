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
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: { translations: true },
    });
    return NextResponse.json({ post });
  }

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { translations: true },
  });

  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { slug, translations } = body;

  const post = await prisma.blogPost.create({
    data: {
      slug,
      translations: {
        create: Object.entries(translations).map(([locale, trans]: [string, any]) => ({
          locale,
          title: trans.title,
          excerpt: trans.excerpt || null,
          content: trans.content || "",
        })),
      },
    },
  });

  return NextResponse.json({ post });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, slug, isPublished, translations } = body;

  await prisma.blogPost.update({
    where: { id },
    data: {
      slug,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    },
  });

  if (translations) {
    for (const [locale, trans] of Object.entries(translations) as [string, any][]) {
      await prisma.blogPostTranslation.upsert({
        where: { blogPostId_locale: { blogPostId: id, locale } },
        update: { title: trans.title, excerpt: trans.excerpt, content: trans.content },
        create: { blogPostId: id, locale, title: trans.title, excerpt: trans.excerpt, content: trans.content },
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

  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
