import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { put } from "@vercel/blob";
import { readFile, readdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

function createPrismaClient() {
  if (process.env.TURSO_DATABASE_URL) {
    const adapter = new PrismaLibSql({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

const prisma = createPrismaClient();

interface GalleryDef {
  categorySlug: string;
  gallerySlug: string;
  translations: Record<string, { title: string; description: string }>;
  images: { file: string; alt: string }[];
}

const galleries: GalleryDef[] = [
  {
    categorySlug: "personal-work",
    gallerySlug: "india-journey",
    translations: {
      tr: { title: "Hindistan Yolculuğu", description: "Hindistan'ın büyüleyici manzaraları ve kültürel zenginlikleri" },
      en: { title: "India Journey", description: "The mesmerizing landscapes and cultural richness of India" },
      fr: { title: "Voyage en Inde", description: "Les paysages fascinants et la richesse culturelle de l'Inde" },
    },
    images: [
      { file: "india-taj-mahal.jpg", alt: "Taj Mahal at sunrise" },
      { file: "india-varanasi.jpg", alt: "Varanasi ghats" },
      { file: "india-landscape.jpg", alt: "Indian landscape" },
      { file: "india-holi.jpg", alt: "Holi festival colors" },
      { file: "india-temple.jpg", alt: "Ancient temple" },
      { file: "india-gate.jpg", alt: "India Gate, New Delhi" },
      { file: "india-river.jpg", alt: "Sacred river" },
      { file: "india-beach.jpg", alt: "Indian coastline" },
    ],
  },
  {
    categorySlug: "personal-work",
    gallerySlug: "streets-and-souls",
    translations: {
      tr: { title: "Sokaklar ve Ruhlar", description: "Hindistan sokaklarından insanlık halleri" },
      en: { title: "Streets & Souls", description: "Human stories from the streets of India" },
      fr: { title: "Rues et Âmes", description: "Histoires humaines des rues de l'Inde" },
    },
    images: [
      { file: "india-fort.jpg", alt: "Historic fort" },
      { file: "india-palace.jpg", alt: "Royal palace" },
      { file: "india-delhi.jpg", alt: "Streets of Delhi" },
      { file: "india-market.jpg", alt: "Colorful market" },
      { file: "india-kerala.jpg", alt: "Kerala backwaters" },
      { file: "india-mountains.jpg", alt: "Himalayan mountains" },
      { file: "india-street.jpg", alt: "Street life" },
    ],
  },
  {
    categorySlug: "commercial",
    gallerySlug: "portraits-and-brands",
    translations: {
      tr: { title: "Portreler ve Markalar", description: "Ticari ve marka çekimleri" },
      en: { title: "Portraits & Brands", description: "Commercial and brand photography" },
      fr: { title: "Portraits et Marques", description: "Photographie commerciale et de marque" },
    },
    images: [
      { file: "commercial-portrait1.jpg", alt: "Portrait session" },
      { file: "commercial-portrait2.jpg", alt: "Studio portrait" },
      { file: "commercial-fashion1.jpg", alt: "Fashion editorial" },
      { file: "commercial-fashion2.jpg", alt: "Fashion shoot" },
      { file: "commercial-event.jpg", alt: "Event photography" },
    ],
  },
  {
    categorySlug: "editorial",
    gallerySlug: "magazine-editorials",
    translations: {
      tr: { title: "Dergi Editöryalleri", description: "Moda ve yaşam tarzı dergileri için editöryal çekimler" },
      en: { title: "Magazine Editorials", description: "Editorial shoots for fashion and lifestyle magazines" },
      fr: { title: "Éditoriaux Magazine", description: "Shootings éditoriaux pour magazines de mode et lifestyle" },
    },
    images: [
      { file: "editorial-fashion1.jpg", alt: "Editorial fashion" },
      { file: "editorial-fashion2.jpg", alt: "Magazine editorial" },
      { file: "editorial-magazine1.jpg", alt: "Portrait editorial" },
      { file: "editorial-magazine2.jpg", alt: "Editorial portrait" },
      { file: "editorial-portrait.jpg", alt: "Lifestyle editorial" },
    ],
  },
];

async function uploadImageToBlob(filename: string): Promise<{
  url: string;
  width: number;
  height: number;
  size: number;
  blurDataUrl: string;
}> {
  const samplesDir = path.join(process.cwd(), "public", "uploads", "samples");
  const inputPath = path.join(samplesDir, filename);
  const buffer = await readFile(inputPath);

  const image = sharp(buffer);
  const metadata = await image.metadata();
  const width = metadata.width || 1200;
  const height = metadata.height || 800;

  // Convert to WebP
  const webpBuffer = await image.webp({ quality: 85 }).toBuffer();

  // Generate blur placeholder
  const blurBuffer = await sharp(buffer)
    .resize(10, 10, { fit: "inside" })
    .webp({ quality: 20 })
    .toBuffer();
  const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

  // Upload to Vercel Blob
  const webpFilename = `${path.parse(filename).name}.webp`;
  const blob = await put(`photos/${webpFilename}`, webpBuffer, {
    access: "public",
    contentType: "image/webp",
  });

  console.log(`  Uploaded: ${blob.url}`);

  return {
    url: blob.url,
    width,
    height,
    size: webpBuffer.length,
    blurDataUrl,
  };
}

async function main() {
  console.log("Uploading images to Vercel Blob and creating galleries...\n");

  for (const gallery of galleries) {
    const category = await prisma.category.findUnique({
      where: { slug: gallery.categorySlug },
    });

    if (!category) {
      console.log(`Category ${gallery.categorySlug} not found, skipping`);
      continue;
    }

    // Check if gallery already exists
    const existing = await prisma.gallery.findUnique({
      where: { slug: gallery.gallerySlug },
    });
    if (existing) {
      console.log(`Gallery ${gallery.gallerySlug} already exists, skipping`);
      continue;
    }

    console.log(`\nCreating gallery: ${gallery.gallerySlug}`);

    const imageIds: string[] = [];

    for (const img of gallery.images) {
      try {
        console.log(`  Processing: ${img.file}`);
        const uploaded = await uploadImageToBlob(img.file);

        const dbImage = await prisma.image.create({
          data: {
            filename: `${path.parse(img.file).name}.webp`,
            originalName: img.file,
            path: uploaded.url,
            width: uploaded.width,
            height: uploaded.height,
            size: uploaded.size,
            mimeType: "image/webp",
            blurDataUrl: uploaded.blurDataUrl,
            alt: img.alt,
          },
        });

        imageIds.push(dbImage.id);
      } catch (err) {
        console.error(`  Error processing ${img.file}:`, err);
      }
    }

    // Create gallery with images
    await prisma.gallery.create({
      data: {
        slug: gallery.gallerySlug,
        categoryId: category.id,
        sortOrder: 0,
        publishedAt: new Date(),
        coverImageId: imageIds[0] || null,
        translations: {
          create: Object.entries(gallery.translations).map(([locale, trans]) => ({
            locale,
            title: trans.title,
            description: trans.description,
          })),
        },
        images: {
          create: imageIds.map((imageId, index) => ({
            imageId,
            sortOrder: index,
          })),
        },
      },
    });

    console.log(`  Gallery created with ${imageIds.length} images`);
  }

  console.log("\nAll uploads complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
