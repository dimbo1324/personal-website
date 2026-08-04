import { Button } from "@repo/ui";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">{t("heading")}</h1>
      <p className="max-w-xl text-lg text-muted-foreground">{t("subheading")}</p>
      <Button asChild>
        <a href="mailto:dimaprihodko180@gmail.com">{t("cta")}</a>
      </Button>
    </main>
  );
}
