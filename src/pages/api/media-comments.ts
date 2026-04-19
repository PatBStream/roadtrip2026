export const prerender = false;
import type { APIRoute } from 'astro';
import { createComment, listComments } from '../../lib/server/comments';
import { requireUser } from '../../lib/server/auth';
import { badRequest, json } from '../../lib/server/http';
import { uploadConstraints } from '../../lib/shared/memories';
import { enforceRateLimit } from '../../lib/server/rate-limit';

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const mediaId = url.searchParams.get('mediaId');

  if (!mediaId) {
    return badRequest('mediaId is required');
  }

  if (locals.user?.role === 'owner') {
    const { listCommentsForAdmin } = await import('../../lib/server/admin');
    const items = await listCommentsForAdmin(locals, mediaId);
    return json({ items });
  }

  const items = await listComments(locals, mediaId);
  return json({ items });
};

export const POST: APIRoute = async ({ request, locals }) => {
  requireUser({ locals });
  await enforceRateLimit(locals, request, {
    scope: 'media-comments-post',
    limit: uploadConstraints.rateLimit.commentPostPerMinute,
    windowSeconds: 60,
  });

  const body = await request.json().catch(() => null) as { mediaId?: string; body?: string } | null;

  if (!body?.mediaId || !body.body?.trim()) {
    return badRequest('mediaId and body are required');
  }

  if (body.body.length > uploadConstraints.comment.maxLength) {
    return badRequest('Comment is too long');
  }

  const result = await createComment(locals, {
    mediaId: body.mediaId,
    userId: locals.user.id,
    body: body.body.trim(),
  });

  return json({ ok: true, id: result.id });
};
