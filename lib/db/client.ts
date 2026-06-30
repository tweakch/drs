import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { getEnv } from '@/lib/env';

// Lazy, memoised Neon SQL client. The connection string is only read (and
// validated) on first use, so importing this module never requires a database.
// Annotated with concrete generics so tagged-template results are typed as
// `Record<string, unknown>[]` (not the widened generic union).
let cached: NeonQueryFunction<false, false> | null = null;

export function sql(): NeonQueryFunction<false, false> {
  if (!cached) {
    cached = neon(getEnv().DATABASE_URL);
  }
  return cached;
}
