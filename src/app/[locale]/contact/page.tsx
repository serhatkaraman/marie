export const dynamic = "force-dynamic";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/contact/ContactForm";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <h1 className="text-3xl font-serif font-normal text-primary mb-2">
        {t("title")}
      </h1>
      <p className="text-muted text-sm mb-10">{t("subtitle")}</p>
      <ContactForm />
    </div>
  );
}
