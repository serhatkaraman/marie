"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function ContactForm() {
  const t = useTranslations("contact");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("success");
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div>
        <label htmlFor="name" className="block text-xs tracking-wider text-muted mb-2 uppercase">
          {t("name")}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full border-b border-border bg-transparent py-2 text-sm text-body focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-xs tracking-wider text-muted mb-2 uppercase">
          {t("email")}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full border-b border-border bg-transparent py-2 text-sm text-body focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-xs tracking-wider text-muted mb-2 uppercase">
          {t("subject")}
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          className="w-full border-b border-border bg-transparent py-2 text-sm text-body focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-xs tracking-wider text-muted mb-2 uppercase">
          {t("message")}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full border-b border-border bg-transparent py-2 text-sm text-body focus:outline-none focus:border-accent transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="text-sm tracking-wider uppercase py-3 px-8 border border-body text-body hover:bg-body hover:text-white transition-all duration-300 disabled:opacity-50"
      >
        {isSubmitting ? t("sending") : t("send")}
      </button>

      {status === "success" && (
        <p className="text-sm text-green-600">{t("success")}</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600">{t("error")}</p>
      )}
    </form>
  );
}
