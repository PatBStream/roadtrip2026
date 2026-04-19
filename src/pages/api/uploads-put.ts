export const prerender = false;
import type { APIRoute } from 'astro';
import { requireUser } from '../../lib/server/auth';
import { getDb } from '../../lib/server/db';
import { getMediaBucket } from '../../lib/server/storage';
import { badRequest, json } from '../../lib/server/http';

export const POST: APIRoute = async ({ request, locals }) => {
  requireUser({ locals });

  const url = new URL(request.url);
  const uploadSessionId = url.searchParams.get('uploadSessionId');

  if (!uploadSessionId) {
    return badRequest('uploadSessionId is required');
  }

  const db = getDb(locals);
  const upload = await db.prepare(`
    SELECT id, storage_key_original, expected_mime_type, expected_bytes, status, expires_at
    FROM upload_sessions
    WHERE id = ? AND user_id = ?
    LIMIT 1
  `).bind(uploadSessionId, locals.user.id).first<{
    id: string;
    storage_key_original: string;
    expected_mime_type: string;
    expected_bytes: number;
    status: string;
    expires_at: string;
  }>();

  if (!upload) {
    return json({ error: 'Upload session not found' }, { status: 404 });
  }

  if (upload.status !== 'pending') {
    return badRequest('Upload session is not pending');
  }

  if (new Date(upload.expires_at).getTime() < Date.now()) {
    return badRequest('Upload session has expired');
  }

  const contentType = request.headers.get('content-type') ?? '';
  const contentLength = Number(request.headers.get('content-length') ?? '0');

  if (contentType !== upload.expected_mime_type) {
    return badRequest('Upload MIME type does not match session');
  }

  if (!request.body) {
    return badRequest('Upload body is required');
  }

  if (!Number.isFinite(contentLength) || contentLength <= 0) {
    return badRequest('Upload content-length header is required');
  }

  if (contentLength !== upload.expected_bytes) {
    return badRequest('Upload byte size does not match session');
  }

  const bucket = getMediaBucket(locals);
  await bucket.put(upload.storage_key_original, request.body, {
    httpMetadata: {
      contentType,
    },
  });

  return json({ ok: true, objectKey: upload.storage_key_original });
};
