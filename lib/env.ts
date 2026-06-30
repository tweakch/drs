import { z } from 'zod';

// The env-var contract from DRS-0001 (.env.example), validated at first use.
// Parsing is lazy via getEnv() so `next build` / CI never throw when no DB or
// Blob credentials are present.
const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DATABASE_URL_UNPOOLED: z.string().min(1).optional(),
  BLOB_READ_WRITE_TOKEN: z.string().min(1),
  // Auth.js (DRS-0003). All optional so build/CI never require secrets; the auth
  // runtime reads these directly from process.env at request time, not via getEnv().
  AUTH_SECRET: z.string().min(1).optional(),
  AUTH_RESEND_KEY: z.string().min(1).optional(),
  AUTH_EMAIL_FROM: z.string().min(1).optional(),
  ADMIN_EMAILS: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export function getEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => ` - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`[DRS] Invalid or missing environment variables:\n${detail}`);
  }
  return parsed.data;
}
