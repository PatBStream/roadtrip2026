export const prerender = false;
import type { APIRoute } from 'astro';
import { requireUser } from '../../lib/server/auth';
import { uploadConstraints, type MediaType } from '../../lib/shared/memories';
import { createUploadSession } from '../../lib/server/uploads';
import { badRequest, json } from '../../lib/server/http';

export const POST: APIRoute = async ({ request, locals }) => {
  requireUser({ locals });

  const body = await request.json().catch(() => null) as {
    type?: MediaType;
    fileName?: string;
    mimeType?: string;
    bytes?: number;
  } | null;

  if (!body?.type || !body.fileName || !body.mimeType || typeof body.bytes !== 'number') {
    return badRequest('type, fileName, mimeType, and bytes are required');
  }

  const constraints = body.type === 'image' ? uploadConstraints.image : uploadConstraints.video;

  if (!constraints.acceptedMimeTypes.includes(body.mimeType as never)) {
    return badRequest('Unsupported MIME type');
  }

  if (body.bytes > constraints.maxBytes) {
    return badRequest('File exceeds maximum allowed size');
  }

  const upload = await createUploadSession(locals, {
    userId: locals.user.id,
    type: body.type,
    fileName: body.fileName,
    mimeType: body.mimeType,
    bytes: body.bytes,
  });

  return json({
    uploadSessionId: upload.id,
    objectKey: upload.storageKeyOriginal,
    uploadMode: 'direct-r2-worker-put-placeholder',
    expiresAt: upload.expiresAt,
    note: 'The browser still needs a direct upload step to place the file at objectKey before completion.',
  });
};
