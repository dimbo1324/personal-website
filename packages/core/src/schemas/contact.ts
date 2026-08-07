import { z } from "zod";

/** Channels a lead can be delivered through once credentials are configured. */
export const leadChannels = ["telegram", "whatsapp", "email"] as const;
export type LeadChannel = (typeof leadChannels)[number];

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя — минимум 2 символа").max(80, "Слишком длинное имя"),
  email: z.email("Проверьте адрес почты"),
  phone: z
    .string()
    .trim()
    .max(32, "Слишком длинный номер")
    .refine(
      (value) => value.length === 0 || /^[+\d][\d\s()-]{6,}$/.test(value),
      "Проверьте номер телефона",
    )
    .optional()
    .or(z.literal("")),
  service: z.string().trim().max(60).optional().or(z.literal("")),
  budget: z.string().trim().max(60).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Опишите задачу — минимум 10 символов")
    .max(2000, "Не больше 2000 символов"),
  /** Honeypot: real users never fill this. */
  company: z.string().max(0).optional().or(z.literal("")),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const leadResponseSchema = z.object({
  ok: z.boolean(),
  /** Channels the lead actually reached. Empty while running in stub mode. */
  delivered: z.array(z.enum(leadChannels)),
  mode: z.enum(["live", "stub"]),
  message: z.string(),
});

export type LeadResponse = z.infer<typeof leadResponseSchema>;
