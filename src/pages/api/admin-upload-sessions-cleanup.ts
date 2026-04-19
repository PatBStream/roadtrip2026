export const prerender = false;
import type { APIRoute } from 'astro';
import { requireOwner } from '../../lib/server/admin';
import { cleanupExpiredUploadSessions } from '../../lib/server/uploads';
import { json } from '../../lib/server/http';

export const POST: APIRoute = async ({ locals }) => {
  requireOwner(locals);
  const result = await cleanupExpiredUploadSessions(locals, { limit: 100 });
  return json({ ok: true, cleaned: result.cleaned });
};
