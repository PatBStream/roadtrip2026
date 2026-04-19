export const prerender = false;
import type { APIRoute } from 'astro';
import { requireOwner, deleteComment } from '../../lib/server/admin';
import { badRequest, json } from '../../lib/server/http';

export const POST: APIRoute = async ({ request, locals }) => {
  requireOwner(locals);
  const body = await request.json().catch(() => null) as { commentId?: string } | null;
  if (!body?.commentId) {
    return badRequest('commentId is required');
  }

  await deleteComment(locals, {
    commentId: body.commentId,
    actorUserId: locals.user!.id,
  });

  return json({ ok: true });
};
