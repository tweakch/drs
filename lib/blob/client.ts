// Vercel Blob helpers. The token is read lazily from the validated env so
// importing this module never throws at build time.
import { del, list, put } from '@vercel/blob';
import { getEnv } from '@/lib/env';

export function blobToken(): string {
  return getEnv().BLOB_READ_WRITE_TOKEN;
}

export { del, list, put };
