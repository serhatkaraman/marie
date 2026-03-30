import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";
import crypto from "crypto";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const filename = `${uniqueId}.webp`;

    // Process with Sharp
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const width = metadata.width || 1200;
    const height = metadata.height || 800;

    const webpBuffer = await image.webp({ quality: 85 }).toBuffer();

    // Generate blur placeholder
    const blurBuffer = await sharp(buffer)
      .resize(10, 10, { fit: "inside" })
      .webp({ quality: 20 })
      .toBuffer();
    const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

    let imagePath: string;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Production: upload to Vercel Blob
      const blob = await put(`photos/${filename}`, webpBuffer, {
        access: "public",
        contentType: "image/webp",
      });
      imagePath = blob.url;
    } else {
      // Development: save to local filesystem
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const uploadDir = path.join(process.cwd(), "public", "uploads", year, month);
      await mkdir(uploadDir, { recursive: true });
      const fullPath = path.join(uploadDir, filename);
      await writeFile(fullPath, webpBuffer);
      imagePath = `/uploads/${year}/${month}/${filename}`;
    }

    // Save to database
    const dbImage = await prisma.image.create({
      data: {
        filename,
        originalName: file.name,
        path: imagePath,
        width,
        height,
        size: webpBuffer.length,
        mimeType: "image/webp",
        blurDataUrl,
      },
    });

    return NextResponse.json({
      success: true,
      image: dbImage,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
