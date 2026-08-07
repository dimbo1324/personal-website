import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { JetBrains_Mono, Manrope, Unbounded } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AccentField } from "@/components/chrome/accent-field";
import { Atmosphere, Grain, ScanSweep } from "@/components/chrome/atmosphere";
import { Cursor } from "@/components/chrome/cursor";
import { Footer } from "@/components/chrome/footer";
import { Navbar } from "@/components/chrome/navbar";
import { Preloader } from "@/components/chrome/preloader";
import { QuickContact } from "@/components/chrome/quick-contact";
import { site } from "@/content/site";
import { routing } from "@/i18n/routing";

import "./globals.css";

/** Manrope carries the text, Unbounded the display voice, JetBrains the data. */
const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  variable: "--font-unbounded",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#05060a",
  colorScheme: "dark",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: { default: t("title"), template: `%s · ${site.shortName}` },
    description: t("description"),
    keywords: [
      "инженерные услуги",
      "проектирование",
      "автоматизация",
      "АСУ ТП",
      "телеметрия",
      "IT-услуги",
      "разработка",
      site.city,
    ],
    authors: [{ name: site.name }],
    openGraph: {
      type: "website",
      locale: "ru_RU",
      title: t("title"),
      description: t("description"),
      siteName: site.name,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`dark ${manrope.variable} ${unbounded.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans antialiased">
        <NextIntlClientProvider>
          <a
            href="#about"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[130] focus:rounded-xl focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-void"
          >
            Перейти к содержимому
          </a>

          <Atmosphere />
          <AccentField />
          <Grain />
          <ScanSweep />
          <Cursor />
          <Preloader />

          <Navbar />
          {children}
          <Footer />
          <QuickContact />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
