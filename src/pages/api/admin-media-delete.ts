export const prerender = false;
import type { APIRoute } from 'astro';
import { requireOwner, deleteMediaItem } from '../../lib/server/admin';
import { badRequest, json } from '../../lib/server/http';

export const POST: APIRoute = async ({ request, locals }) => {
  requireOwner(locals);
  const body = await request.json().catch(() => null) as { mediaId?: string } | null;
  if (!body?.mediaId) {
    return badRequest('mediaId is required');
  }

  await deleteMediaItem(locals, {
    mediaId: body.mediaId,
    actorUserId: locals.user!.id,
  });

  return json({ ok: true });
};
