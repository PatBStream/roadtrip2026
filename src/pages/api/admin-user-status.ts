export const prerender = false;
import type { APIRoute } from 'astro';
import { requireOwner, updateUserStatus } from '../../lib/server/admin';
import { badRequest, json } from '../../lib/server/http';

export const POST: APIRoute = async ({ request, locals }) => {
  requireOwner(locals);
  const body = await request.json().catch(() => null) as { userId?: string; status?: 'invited' | 'active' | 'disabled' } | null;
  if (!body?.userId || !body.status) {
    return badRequest('userId and status are required');
  }

  await updateUserStatus(locals, {
    userId: body.userId,
    status: body.status,
    actorUserId: locals.user!.id,
  });

  return json({ ok: true });
};
