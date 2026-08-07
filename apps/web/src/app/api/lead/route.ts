import { contactFormSchema, type LeadResponse } from "@repo/core/schemas";
import { NextResponse } from "next/server";

import { deliverLead, formatLead } from "@/server/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Naive in-memory throttle. Swap for Redis/Upstash before going multi-instance. */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > MAX_PER_WINDOW;
}

function json(body: LeadResponse, status: number): NextResponse {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request): Promise<NextResponse> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  if (isRateLimited(ip)) {
    return json(
      {
        ok: false,
        delivered: [],
        mode: "stub",
        message: "Слишком много заявок подряд. Попробуйте через минуту.",
      },
      429,
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, delivered: [], mode: "stub", message: "Некорректный запрос." }, 400);
  }

  const parsed = contactFormSchema.safeParse(payload);
  if (!parsed.success) {
    return json(
      { ok: false, delivered: [], mode: "stub", message: "Проверьте заполнение полей формы." },
      422,
    );
  }

  // Honeypot hit: pretend everything went fine, deliver nothing.
  if (parsed.data.company) {
    return json({ ok: true, delivered: [], mode: "stub", message: "Заявка принята." }, 200);
  }

  const text = formatLead(parsed.data, { at: new Date(), source: "prihodko.dev" });
  const report = await deliverLead(text);

  if (!report.configured) {
    // No credentials yet — log it so nothing is silently lost during setup.
    console.info("[lead] channels not configured, lead logged only:\n%s", text);
    return json(
      {
        ok: true,
        delivered: [],
        mode: "stub",
        message:
          "Заявка принята. Каналы доставки ещё не подключены — сообщение сохранено в логах сервера.",
      },
      200,
    );
  }

  if (report.delivered.length === 0) {
    console.error("[lead] every configured channel failed:\n%s", text);
    return json(
      {
        ok: false,
        delivered: [],
        mode: "live",
        message: "Не удалось отправить заявку. Напишите, пожалуйста, в Telegram или WhatsApp.",
      },
      502,
    );
  }

  return json(
    {
      ok: true,
      delivered: report.delivered,
      mode: "live",
      message: "Заявка отправлена. Отвечу в ближайшее время.",
    },
    200,
  );
}
