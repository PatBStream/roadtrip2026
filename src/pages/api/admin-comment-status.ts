export const prerender = false;
import type { APIRoute } from 'astro';
import { requireOwner, hideComment, unhideComment } from '../../lib/server/admin';
import { badRequest, json } from '../../lib/server/http';

export const POST: APIRoute = async ({ request, locals }) => {
  requireOwner(locals);
  const body = await request.json().catch(() => null) as { commentId?: string; action?: 'hide' | 'unhide' } | null;
  if (!body?.commentId || !body.action) {
    return badRequest('commentId and action are required');
  }

  if (body.action === 'hide') {
    await hideComment(locals, { commentId: body.commentId, actorUserId: locals.user!.id });
  } else {
    await unhideComment(locals, { commentId: body.commentId, actorUserId: locals.user!.id });
  }

  return json({ ok: true });
};
