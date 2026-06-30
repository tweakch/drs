// Auth.js route handler — pinned to the Node runtime (DB-backed adapter).
import { handlers } from '@/auth';

export const runtime = 'nodejs';
export const { GET, POST } = handlers;
