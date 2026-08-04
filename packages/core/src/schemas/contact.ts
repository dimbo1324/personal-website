import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email(),
  message: z.string().trim().min(10).max(2000),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
