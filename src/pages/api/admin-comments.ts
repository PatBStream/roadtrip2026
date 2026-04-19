export const prerender = false;
import type { APIRoute } from 'astro';
import { requireOwner, hideComment, listCommentsForAdmin } from '../../lib/server/admin';
import { badRequest, json } from '../../lib/server/http';

export const GET: APIRoute = async ({ request, locals }) => {
  requireOwner(locals);
  const url = new URL(request.url);
  const mediaId = url.searchParams.get('mediaId') || undefined;
  const items = await listCommentsForAdmin(locals, mediaId);
  return json({ items });
};

export const POST: APIRoute = async ({ request, locals }) => {
  requireOwner(locals);
  const body = await request.json().catch(() => null) as { commentId?: string; action?: 'hide' | 'unhide' } | null;
  if (!body?.commentId) {
    return badRequest('commentId is required');
  }

  if (body.action === 'unhide') {
    const { unhideComment } = await import('../../lib/server/admin');
    await unhideComment(locals, {
      commentId: body.commentId,
      actorUserId: locals.user!.id,
    });
  } else {
    await hideComment(locals, {
      commentId: body.commentId,
      actorUserId: locals.user!.id,
    });
  }

  return json({ ok: true });
};
