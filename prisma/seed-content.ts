import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import { readdir, readFile, mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const prisma = new PrismaClient();

interface ImageInfo {
  file: string;
  alt: string;
}

const personalWorkImages: ImageInfo[] = [
  { file: "india-taj-mahal.jpg", alt: "Taj Mahal at sunrise" },
  { file: "india-varanasi.jpg", alt: "Varanasi ghats" },
  { file: "india-landscape.jpg", alt: "Indian landscape" },
  { file: "india-holi.jpg", alt: "Holi festival colors" },
  { file: "india-temple.jpg", alt: "Ancient temple" },
  { file: "india-gate.jpg", alt: "India Gate, New Delhi" },
  { file: "india-river.jpg", alt: "Sacred river" },
  { file: "india-beach.jpg", alt: "Indian coastline" },
  { file: "india-fort.jpg", alt: "Historic fort" },
  { file: "india-palace.jpg", alt: "Royal palace" },
  { file: "india-delhi.jpg", alt: "Streets of Delhi" },
  { file: "india-market.jpg", alt: "Colorful market" },
  { file: "india-kerala.jpg", alt: "Kerala backwaters" },
  { file: "india-mountains.jpg", alt: "Himalayan mountains" },
  { file: "india-street.jpg", alt: "Street life" },
];

const commercialImages: ImageInfo[] = [
  { file: "commercial-portrait1.jpg", alt: "Portrait session" },
  { file: "commercial-portrait2.jpg", alt: "Studio portrait" },
  { file: "commercial-fashion1.jpg", alt: "Fashion editorial" },
  { file: "commercial-fashion2.jpg", alt: "Fashion shoot" },
  { file: "commercial-event.jpg", alt: "Event photography" },
];

const editorialImages: ImageInfo[] = [
  { file: "editorial-fashion1.jpg", alt: "Editorial fashion" },
  { file: "editorial-fashion2.jpg", alt: "Magazine editorial" },
  { file: "editorial-magazine1.jpg", alt: "Portrait editorial" },
  { file: "editorial-magazine2.jpg", alt: "Editorial portrait" },
  { file: "editorial-portrait.jpg", alt: "Lifestyle editorial" },
];

async function processImage(filename: string): Promise<{
  webpFilename: string;
  relativePath: string;
  width: number;
  height: number;
  size: number;
  blurDataUrl: string;
}> {
  const samplesDir = path.join(process.cwd(), "public", "uploads", "samples");
  const outputDir = path.join(process.cwd(), "public", "uploads", "2025", "content");
  await mkdir(outputDir, { recursive: true });

  const inputPath = path.join(samplesDir, filename);
  const buffer = await readFile(inputPath);
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const width = metadata.width || 1200;
  const height = metadata.height || 800;

  const uniqueId = crypto.randomBytes(6).toString("hex");
  const webpFilename = `${path.parse(filename).name}-${uniqueId}.webp`;
  const outputPath = path.join(outputDir, webpFilename);

  await image.webp({ quality: 85 }).toFile(outputPath);

  const blurBuffer = await sharp(buffer)
    .resize(10, 10, { fit: "inside" })
    .webp({ quality: 20 })
    .toBuffer();
  const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

  const { size } = await import("fs").then((fs) => fs.statSync(outputPath));

  return {
    webpFilename,
    relativePath: `/uploads/2025/content/${webpFilename}`,
    width,
    height,
    size,
    blurDataUrl,
  };
}

async function createImagesAndGallery(
  categorySlug: string,
  gallerySlug: string,
  galleryTranslations: Record<string, { title: string; description: string }>,
  images: ImageInfo[]
) {
  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) {
    console.log(`Category ${categorySlug} not found, skipping`);
    return;
  }

  // Check if gallery already exists
  const existing = await prisma.gallery.findUnique({ where: { slug: gallerySlug } });
  if (existing) {
    console.log(`Gallery ${gallerySlug} already exists, skipping`);
    return;
  }

  console.log(`Creating gallery: ${gallerySlug}`);

  const imageRecords: string[] = [];

  for (const img of images) {
    console.log(`  Processing: ${img.file}`);
    try {
      const processed = await processImage(img.file);
      const dbImage = await prisma.image.create({
        data: {
          filename: processed.webpFilename,
          originalName: img.file,
          path: processed.relativePath,
          width: processed.width,
          height: processed.height,
          size: processed.size,
          mimeType: "image/webp",
          blurDataUrl: processed.blurDataUrl,
          alt: img.alt,
        },
      });
      imageRecords.push(dbImage.id);
    } catch (err) {
      console.error(`  Error processing ${img.file}:`, err);
    }
  }

  // Create gallery
  const gallery = await prisma.gallery.create({
    data: {
      slug: gallerySlug,
      categoryId: category.id,
      sortOrder: 0,
      publishedAt: new Date(),
      translations: {
        create: Object.entries(galleryTranslations).map(([locale, trans]) => ({
          locale,
          title: trans.title,
          description: trans.description,
        })),
      },
      images: {
        create: imageRecords.map((imageId, index) => ({
          imageId,
          sortOrder: index,
        })),
      },
    },
  });

  console.log(`  Gallery created with ${imageRecords.length} images`);
  return gallery;
}

async function updateAboutPage() {
  const page = await prisma.page.findUnique({ where: { slug: "about" } });
  if (!page) return;

  const aboutContent = {
    tr: {
      title: "Marie Meister",
      content: `Marie Meister, İstanbul merkezli bir fotoğrafçı ve görsel hikaye anlatıcısıdır.

Hindistan'ın büyüleyici coğrafyasından, kadim tapınaklarından ve canlı sokak yaşamından derinden etkilenen Marie, kamerasıyla Doğu ile Batı arasında köprüler kurar. Çalışmaları; doğa, manzara, portre ve seyahat fotoğrafçılığını kapsayan geniş bir yelpazeye yayılır.

Kişisel projelerinin yanı sıra moda markaları, dergiler ve kurumsal müşteriler için editöryal ve ticari çekimler de gerçekleştirmektedir.

Işığı, rengi ve anın duygusunu yakalamaya olan tutkusu, her karesinde kendini hissettirir.

İş birliği ve proje teklifleri için iletişim sayfasından ulaşabilirsiniz.

Istanbul, Türkiye
hypsoindia@gmail.com`,
    },
    en: {
      title: "Marie Meister",
      content: `Marie Meister is an Istanbul-based photographer and visual storyteller.

Deeply inspired by India's mesmerizing geography, ancient temples, and vibrant street life, Marie builds bridges between East and West through her lens. Her work spans a wide range including nature, landscape, portrait, and travel photography.

Alongside personal projects, she also produces editorial and commercial shoots for fashion brands, magazines, and corporate clients.

Her passion for capturing light, color, and the emotion of the moment is felt in every frame.

For collaborations and project inquiries, please visit the contact page.

Istanbul, Turkey
hypsoindia@gmail.com`,
    },
    fr: {
      title: "Marie Meister",
      content: `Marie Meister est une photographe et narratrice visuelle basée à Istanbul.

Profondément inspirée par la géographie fascinante de l'Inde, ses temples ancestraux et sa vie de rue vibrante, Marie construit des ponts entre l'Orient et l'Occident à travers son objectif. Son travail couvre un large éventail comprenant la photographie de nature, de paysage, de portrait et de voyage.

En parallèle de ses projets personnels, elle réalise également des shootings éditoriaux et commerciaux pour des marques de mode, des magazines et des clients corporatifs.

Sa passion pour capturer la lumière, la couleur et l'émotion du moment se ressent dans chaque image.

Pour les collaborations et demandes de projets, veuillez visiter la page de contact.

Istanbul, Turquie
hypsoindia@gmail.com`,
    },
  };

  for (const [locale, trans] of Object.entries(aboutContent)) {
    await prisma.pageTranslation.upsert({
      where: { pageId_locale: { pageId: page.id, locale } },
      update: { title: trans.title, content: trans.content },
      create: { pageId: page.id, locale, title: trans.title, content: trans.content },
    });
  }
  console.log("About page updated");
}

async function main() {
  console.log("Starting content seed...\n");

  // Personal Work galleries
  await createImagesAndGallery(
    "personal-work",
    "india-journey",
    {
      tr: { title: "Hindistan Yolculuğu", description: "Hindistan'ın büyüleyici manzaraları ve kültürel zenginlikleri" },
      en: { title: "India Journey", description: "The mesmerizing landscapes and cultural richness of India" },
      fr: { title: "Voyage en Inde", description: "Les paysages fascinants et la richesse culturelle de l'Inde" },
    },
    personalWorkImages.slice(0, 8)
  );

  await createImagesAndGallery(
    "personal-work",
    "streets-and-souls",
    {
      tr: { title: "Sokaklar ve Ruhlar", description: "Hindistan sokaklarından insanlık halleri" },
      en: { title: "Streets & Souls", description: "Human stories from the streets of India" },
      fr: { title: "Rues et Âmes", description: "Histoires humaines des rues de l'Inde" },
    },
    personalWorkImages.slice(8, 15)
  );

  // Commercial gallery
  await createImagesAndGallery(
    "commercial",
    "portraits-and-brands",
    {
      tr: { title: "Portreler ve Markalar", description: "Ticari ve marka çekimleri" },
      en: { title: "Portraits & Brands", description: "Commercial and brand photography" },
      fr: { title: "Portraits et Marques", description: "Photographie commerciale et de marque" },
    },
    commercialImages
  );

  // Editorial gallery
  await createImagesAndGallery(
    "editorial",
    "magazine-editorials",
    {
      tr: { title: "Dergi Editöryalleri", description: "Moda ve yaşam tarzı dergileri için editöryal çekimler" },
      en: { title: "Magazine Editorials", description: "Editorial shoots for fashion and lifestyle magazines" },
      fr: { title: "Éditoriaux Magazine", description: "Shootings éditoriaux pour magazines de mode et lifestyle" },
    },
    editorialImages
  );

  // Update about page
  await updateAboutPage();

  // Create sample blog posts
  const existingPosts = await prisma.blogPost.count();
  if (existingPosts === 0) {
    console.log("\nCreating sample blog posts...");

    await prisma.blogPost.create({
      data: {
        slug: "behind-the-lens-india",
        isPublished: true,
        publishedAt: new Date("2025-11-15"),
        translations: {
          create: [
            {
              locale: "tr",
              title: "Objektifin Arkasında: Hindistan",
              excerpt: "Hindistan'daki ilk fotoğraf yolculuğumdan notlar ve düşünceler.",
              content: `Hindistan'a ilk adımımı attığım an, her şeyin değişeceğini hissettim. Renklerin, kokuların ve seslerin bu kadar yoğun bir şekilde iç içe geçtiği başka bir yer bilmiyorum.

Varanasi'nin ghat'larında şafak vakti, Ganj Nehri'nin üzerinden yükselen sis arasında, hayat ile ölüm arasındaki ince çizgiyi fotoğraflamak... Bu deneyim beni sonsuza kadar değiştirdi.

Her kare, bir hikaye anlatıyor. Her yüz, bir evren taşıyor.

Bu seri, üç aylık Hindistan yolculuğumun ilk bölümüdür. Devamı gelecek.`,
            },
            {
              locale: "en",
              title: "Behind the Lens: India",
              excerpt: "Notes and reflections from my first photography journey in India.",
              content: `The moment I set foot in India, I felt everything would change. I don't know of another place where colors, scents, and sounds intertwine so intensely.

Photographing the thin line between life and death at dawn on the ghats of Varanasi, amidst the mist rising over the Ganges... This experience changed me forever.

Every frame tells a story. Every face carries a universe.

This series is the first chapter of my three-month journey through India. More to come.`,
            },
            {
              locale: "fr",
              title: "Derrière l'Objectif : L'Inde",
              excerpt: "Notes et réflexions de mon premier voyage photographique en Inde.",
              content: `Le moment où j'ai posé le pied en Inde, j'ai senti que tout allait changer. Je ne connais pas d'autre endroit où les couleurs, les odeurs et les sons s'entremêlent aussi intensément.

Photographier la fine ligne entre la vie et la mort à l'aube sur les ghats de Varanasi, dans la brume qui s'élève au-dessus du Gange... Cette expérience m'a changée à jamais.

Chaque image raconte une histoire. Chaque visage porte un univers.

Cette série est le premier chapitre de mon voyage de trois mois à travers l'Inde. La suite arrive bientôt.`,
            },
          ],
        },
      },
    });

    await prisma.blogPost.create({
      data: {
        slug: "light-and-color",
        isPublished: true,
        publishedAt: new Date("2025-12-20"),
        translations: {
          create: [
            {
              locale: "tr",
              title: "Işık ve Renk Üzerine",
              excerpt: "Fotoğrafçılıkta ışığın ve rengin rolü üzerine düşüncelerim.",
              content: `Fotoğrafçılık, sonuçta ışıkla yazma sanatıdır. Hindistan'da ışık bambaşka bir karakter taşır - altın sarısı sabahlar, turuncu günbatımları, neon ışıklı sokaklar.

Renk ise bu ışığın ruh halidir. Holi festivalinde havada uçuşan pigmentler, Rajasthan'ın çöl topraklarındaki pastel tonlar, Kerala'nın yemyeşil doğası...

Her biri kendi hikayesini anlatır. Benim işim sadece dinlemek ve deklanşöre basmak.`,
            },
            {
              locale: "en",
              title: "On Light and Color",
              excerpt: "My thoughts on the role of light and color in photography.",
              content: `Photography is, ultimately, the art of writing with light. In India, light carries a completely different character - golden mornings, orange sunsets, neon-lit streets.

Color is the mood of this light. Pigments flying through the air during Holi, pastel tones in the desert sands of Rajasthan, the lush green nature of Kerala...

Each tells its own story. My job is simply to listen and press the shutter.`,
            },
            {
              locale: "fr",
              title: "Sur la Lumière et la Couleur",
              excerpt: "Mes réflexions sur le rôle de la lumière et de la couleur en photographie.",
              content: `La photographie est, en fin de compte, l'art d'écrire avec la lumière. En Inde, la lumière porte un caractère complètement différent - des matins dorés, des couchers de soleil orangés, des rues illuminées au néon.

La couleur est l'humeur de cette lumière. Les pigments volant dans l'air pendant Holi, les tons pastels dans les sables du désert du Rajasthan, la nature verdoyante du Kerala...

Chacun raconte sa propre histoire. Mon travail consiste simplement à écouter et à appuyer sur le déclencheur.`,
            },
          ],
        },
      },
    });

    console.log("Blog posts created");
  }

  console.log("\nContent seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
