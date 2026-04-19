import { createId } from './ids';
import { getDb } from './db';
import { objectExists } from './storage';
import type { MediaType } from '../shared/memories';

export async function createUploadSession(locals: App.Locals, input: {
  userId: string;
  type: MediaType;
  fileName: string;
  mimeType: string;
  bytes: number;
}) {
  const db = getDb(locals);
  const id = createId('upload');
  const ext = input.fileName.includes('.') ? input.fileName.split('.').pop() : 'bin';
  const storageKeyOriginal = `uploads/${input.userId}/${id}/original.${ext}`;
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15).toISOString();

  await db.prepare(`
    INSERT INTO upload_sessions (id, user_id, expected_mime_type, expected_bytes, storage_key_original, status, expires_at)
    VALUES (?, ?, ?, ?, ?, 'pending', ?)
  `).bind(id, input.userId, input.mimeType, input.bytes, storageKeyOriginal, expiresAt).run();

  return {
    id,
    storageKeyOriginal,
    expiresAt,
  };
}

export async function completeUploadSession(locals: App.Locals, input: {
  uploadSessionId: string;
  userId: string;
  fileName: string;
  mimeType: string;
  bytes: number;
  caption?: string | null;
  tripDay?: number | null;
  mediaType: MediaType;
}) {
  const db = getDb(locals);
  const upload = await db.prepare(`
    SELECT id, storage_key_original, expected_mime_type, expected_bytes, status
    FROM upload_sessions
    WHERE id = ? AND user_id = ?
    LIMIT 1
  `).bind(input.uploadSessionId, input.userId).first<{ id: string; storage_key_original: string; expected_mime_type: string; expected_bytes: number; status: string }>();

  if (!upload) {
    throw new Error('Upload session not found');
  }

  if (upload.status !== 'pending') {
    throw new Error('Upload session is not pending');
  }

  if (upload.expected_mime_type !== input.mimeType || upload.expected_bytes !== input.bytes) {
    throw new Error('Upload metadata does not match the signed upload session');
  }

  const exists = await objectExists(locals, upload.storage_key_original);
  if (!exists) {
    throw new Error('Uploaded object was not found in storage');
  }

  const mediaId = createId('media');

  await db.batch([
    db.prepare(`
      INSERT INTO media_items (id, uploader_user_id, type, storage_key_original, storage_key_preview, storage_key_thumbnail, file_name, mime_type, bytes, trip_day, caption, status)
      VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, 'ready')
    `).bind(mediaId, input.userId, input.mediaType, upload.storage_key_original, input.fileName, input.mimeType, input.bytes, input.tripDay ?? null, input.caption ?? null),
    db.prepare(`
      UPDATE upload_sessions
      SET status = 'completed'
      WHERE id = ?
    `).bind(upload.id),
  ]);

  return {
    mediaId,
    storageKeyOriginal: upload.storage_key_original,
  };
}
