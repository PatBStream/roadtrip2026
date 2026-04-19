export const prerender = false;
import type { APIRoute } from 'astro';
import { requireUser } from '../../lib/server/auth';
import { completeUploadSession } from '../../lib/server/uploads';
import { badRequest, json } from '../../lib/server/http';
import type { MediaType } from '../../lib/shared/memories';

export const POST: APIRoute = async ({ request, locals }) => {
  requireUser({ locals });

  const body = await request.json().catch(() => null) as {
    uploadSessionId?: string;
    fileName?: string;
    mimeType?: string;
    bytes?: number;
    caption?: string | null;
    tripDay?: number | null;
    mediaType?: MediaType;
  } | null;

  if (!body?.uploadSessionId || !body.fileName || !body.mimeType || typeof body.bytes !== 'number' || !body.mediaType) {
    return badRequest('uploadSessionId, fileName, mimeType, bytes, and mediaType are required');
  }

  try {
    const media = await completeUploadSession(locals, {
      uploadSessionId: body.uploadSessionId,
      userId: locals.user.id,
      fileName: body.fileName,
      mimeType: body.mimeType,
      bytes: body.bytes,
      caption: body.caption ?? null,
      tripDay: body.tripDay ?? null,
      mediaType: body.mediaType,
    });

    return json({ ok: true, mediaId: media.mediaId, objectKey: media.storageKeyOriginal });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload completion failed';
    return json({ error: message }, { status: 400 });
  }
};
