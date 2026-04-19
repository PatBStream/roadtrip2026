export const prerender = false;
import type { APIRoute } from 'astro';
import { requireOwner, hideMediaItem, unhideMediaItem } from '../../lib/server/admin';
import { badRequest, json } from '../../lib/server/http';

export const POST: APIRoute = async ({ request, locals }) => {
  requireOwner(locals);
  const body = await request.json().catch(() => null) as { mediaId?: string; action?: 'hide' | 'unhide' } | null;
  if (!body?.mediaId || !body.action) {
    return badRequest('mediaId and action are required');
  }

  if (body.action === 'hide') {
    await hideMediaItem(locals, { mediaId: body.mediaId, actorUserId: locals.user!.id });
  } else {
    await unhideMediaItem(locals, { mediaId: body.mediaId, actorUserId: locals.user!.id });
  }

  return json({ ok: true });
};
