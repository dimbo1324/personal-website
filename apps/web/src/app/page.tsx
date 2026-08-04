import { Button } from "@repo/ui";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Dmitry Prikhodko</h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        This site is under construction. Check back soon.
      </p>
      <Button asChild>
        <a href="mailto:dimaprihodko180@gmail.com">Get in touch</a>
      </Button>
    </main>
  );
}
