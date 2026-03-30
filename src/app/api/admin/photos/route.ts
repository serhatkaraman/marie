import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob";
import { unlink } from "fs/promises";
import path from "path";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const images = await prisma.image.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ images });
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

  const image = await prisma.image.findUnique({ where: { id } });
  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete file
  try {
    if (image.path.startsWith("https://")) {
      // Vercel Blob
      await del(image.path);
    } else {
      // Local filesystem
      const filePath = path.join(process.cwd(), "public", image.path);
      await unlink(filePath);
    }
  } catch {
    // File may not exist, continue
  }

  await prisma.image.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
