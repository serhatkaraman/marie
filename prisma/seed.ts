import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { hash } from "bcryptjs";

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

async function main() {
  // Create admin user
  const password = await hash(process.env.ADMIN_PASSWORD || "admin123", 12);
  await prisma.user.upsert({
    where: { username: process.env.ADMIN_USERNAME || "admin" },
    update: {},
    create: {
      username: process.env.ADMIN_USERNAME || "admin",
      password,
      name: "Admin",
    },
  });

  // Create categories
  const categories = [
    {
      slug: "personal-work",
      sortOrder: 0,
      translations: {
        tr: { name: "Kişisel Çalışmalar", description: "Kişisel fotoğraf projeleri" },
        en: { name: "Personal Work", description: "Personal photography projects" },
        fr: { name: "Travail Personnel", description: "Projets photographiques personnels" },
      },
    },
    {
      slug: "commercial",
      sortOrder: 1,
      translations: {
        tr: { name: "Ticari", description: "Ticari fotoğraf çalışmaları" },
        en: { name: "Commercial", description: "Commercial photography work" },
        fr: { name: "Commercial", description: "Travaux photographiques commerciaux" },
      },
    },
    {
      slug: "editorial",
      sortOrder: 2,
      translations: {
        tr: { name: "Editöryal", description: "Dergi ve editöryal çalışmalar" },
        en: { name: "Editorial", description: "Magazine and editorial work" },
        fr: { name: "Éditorial", description: "Travaux éditoriaux et magazines" },
      },
    },
    {
      slug: "films",
      sortOrder: 3,
      translations: {
        tr: { name: "Filmler", description: "Video ve film projeleri" },
        en: { name: "Films", description: "Video and film projects" },
        fr: { name: "Films", description: "Projets vidéo et films" },
      },
    },
  ];

  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        slug: cat.slug,
        sortOrder: cat.sortOrder,
      },
    });

    for (const [locale, trans] of Object.entries(cat.translations)) {
      await prisma.categoryTranslation.upsert({
        where: {
          categoryId_locale: { categoryId: category.id, locale },
        },
        update: { name: trans.name, description: trans.description },
        create: {
          categoryId: category.id,
          locale,
          name: trans.name,
          description: trans.description,
        },
      });
    }
  }

  // Create pages
  const pages = [
    {
      slug: "about",
      template: "about",
      translations: {
        tr: {
          title: "Hakkında",
          content:
            "Marie Meister, doğa ve manzara fotoğrafçılığı konusunda uzmanlaşmış bir fotoğrafçıdır. Hindistan'ın büyüleyici manzaralarından ilham alarak, doğanın güzelliğini objektifine yansıtmaktadır.",
        },
        en: {
          title: "About",
          content:
            "Marie Meister is a photographer specializing in nature and landscape photography. Inspired by the mesmerizing landscapes of India, she captures the beauty of nature through her lens.",
        },
        fr: {
          title: "À Propos",
          content:
            "Marie Meister est une photographe spécialisée dans la photographie de nature et de paysage. Inspirée par les paysages fascinants de l'Inde, elle capture la beauté de la nature à travers son objectif.",
        },
      },
    },
    {
      slug: "print-sale",
      template: "print-sale",
      translations: {
        tr: {
          title: "Baskı Satış",
          content: "Baskı satışları yakında burada olacak.",
        },
        en: {
          title: "Print Sale",
          content: "Print sales coming soon.",
        },
        fr: {
          title: "Vente de Tirages",
          content: "Les ventes de tirages arrivent bientôt.",
        },
      },
    },
  ];

  for (const pg of pages) {
    const page = await prisma.page.upsert({
      where: { slug: pg.slug },
      update: {},
      create: {
        slug: pg.slug,
        template: pg.template,
      },
    });

    for (const [locale, trans] of Object.entries(pg.translations)) {
      await prisma.pageTranslation.upsert({
        where: {
          pageId_locale: { pageId: page.id, locale },
        },
        update: { title: trans.title, content: trans.content },
        create: {
          pageId: page.id,
          locale,
          title: trans.title,
          content: trans.content,
        },
      });
    }
  }

  // Create menu items
  const menuItems = [
    {
      type: "category",
      sortOrder: 0,
      translations: {
        tr: "Kişisel Çalışmalar",
        en: "Personal Work",
        fr: "Travail Personnel",
      },
    },
    {
      type: "category",
      sortOrder: 1,
      translations: { tr: "Ticari", en: "Commercial", fr: "Commercial" },
    },
    {
      type: "category",
      sortOrder: 2,
      translations: { tr: "Editöryal", en: "Editorial", fr: "Éditorial" },
    },
    {
      type: "category",
      sortOrder: 3,
      translations: { tr: "Filmler", en: "Films", fr: "Films" },
    },
    {
      type: "page",
      sortOrder: 4,
      translations: { tr: "Hakkında", en: "About", fr: "À Propos" },
    },
    {
      type: "page",
      sortOrder: 5,
      translations: { tr: "Blog", en: "Blog", fr: "Blog" },
    },
    {
      type: "page",
      sortOrder: 6,
      translations: { tr: "İletişim", en: "Contact", fr: "Contact" },
    },
    {
      type: "page",
      sortOrder: 7,
      translations: {
        tr: "Baskı Satış",
        en: "Print Sale",
        fr: "Vente de Tirages",
      },
    },
  ];

  for (const item of menuItems) {
    const menuItem = await prisma.menuItem.create({
      data: {
        type: item.type,
        sortOrder: item.sortOrder,
      },
    });

    for (const [locale, label] of Object.entries(item.translations)) {
      await prisma.menuItemTranslation.create({
        data: {
          menuItemId: menuItem.id,
          locale,
          label,
        },
      });
    }
  }

  // Create default settings
  const settings = [
    { key: "site_title", value: "Marie Meister" },
    { key: "site_description", value: "Photography Portfolio" },
    { key: "contact_email", value: "hello@mariemeister.com" },
    { key: "instagram_url", value: "https://www.instagram.com/hypsoindia/" },
    { key: "hero_text", value: "Marie Meister" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
