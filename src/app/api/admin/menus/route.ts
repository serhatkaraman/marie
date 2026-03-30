import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.menuItem.findMany({
    orderBy: { sortOrder: "asc" },
    include: { translations: true },
  });

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, url, translations } = body;

  const maxOrder = await prisma.menuItem.aggregate({ _max: { sortOrder: true } });
  const nextOrder = (maxOrder._max.sortOrder || 0) + 1;

  const item = await prisma.menuItem.create({
    data: {
      type,
      url,
      sortOrder: nextOrder,
      translations: {
        create: Object.entries(translations).map(([locale, label]: [string, any]) => ({
          locale,
          label: label as string,
        })),
      },
    },
  });

  return NextResponse.json({ item });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, isVisible, sortOrder } = body;

  await prisma.menuItem.update({
    where: { id },
    data: { ...(isVisible !== undefined && { isVisible }), ...(sortOrder !== undefined && { sortOrder }) },
  });

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

  await prisma.menuItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
