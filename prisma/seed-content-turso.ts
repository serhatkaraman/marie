import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

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
  console.log("Starting content seed (text only, no images)...\n");

  // Update about page
  await updateAboutPage();

  // Create sample blog posts
  const existingPosts = await prisma.blogPost.count();
  if (existingPosts === 0) {
    console.log("Creating sample blog posts...");

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
