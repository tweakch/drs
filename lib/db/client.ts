import { neon } from '@neondatabase/serverless';
import { getEnv } from '@/lib/env';

// Lazy, memoised Neon SQL client. The connection string is only read (and
// validated) on first use, so importing this module never requires a database.
let cached: ReturnType<typeof neon> | null = null;

export function sql() {
  if (!cached) {
    cached = neon(getEnv().DATABASE_URL);
  }
  return cached;
}
