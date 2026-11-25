# Personal Website — instructions for GitHub Copilot

Follow `AGENTS.md` in the repository root: it is the complete, generated rule set shared
by every AI assistant in this repository (sources in `.ai/`). The essentials:

- Stack: Astro 7, TypeScript (strict), Tailwind CSS v4, Lucide icons, Cloudflare Pages
  Functions, Turnstile, Telegram Bot API, WhatsApp `wa.me` links.
- Security first: never log or commit secrets, tokens or visitor data; fail closed — an
  unverified token or failed upstream is never reported as success.
- Behaviour lives in small classes; `fetch` is injected; Astro components only render.
- Formatting is mechanical: `npm run fmt`; the gate is `npm run gate`.
- English in code and commits; Russian in `docs/__arch__/`.
