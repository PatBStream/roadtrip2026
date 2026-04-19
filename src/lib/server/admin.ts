import { getDb, listRecentMedia } from './db';
import { createInvitedUser, findUserByEmail } from './users';
import { createId } from './ids';
import { getMediaBucket } from './storage';

export function requireOwner(locals: App.Locals) {
  if (!locals.user) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  if (locals.user.role !== 'owner') {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
}

export async function listUsers(locals: App.Locals) {
  const db = getDb(locals);
  const result = await db.prepare(`
    SELECT id, email, display_name, role, status, created_at, last_seen_at
    FROM users
    ORDER BY created_at DESC
  `).all();

  return result.results ?? [];
}

export async function createInvite(locals: App.Locals, input: { email: string; displayName: string; role?: 'owner' | 'member' | 'moderator' }) {
  const existing = await findUserByEmail(locals, input.email);
  if (existing) {
    return { existing: true as const, userId: existing.id };
  }

  const user = await createInvitedUser(locals, {
    email: input.email,
    displayName: input.displayName,
    role: input.role ?? 'member',
    status: 'invited',
  });

  return { existing: false as const, userId: user.id };
}

export async function listAdminMedia(locals: App.Locals) {
  const base = await listRecentMedia(locals);
  const db = getDb(locals);
  const hidden = await db.prepare(`
    SELECT
      m.id,
      m.type,
      m.caption,
      m.trip_day,
      m.storage_key_original,
      m.storage_key_thumbnail,
      m.storage_key_preview,
      m.created_at,
      m.status,
      u.display_name,
      0 AS comment_count
    FROM media_items m
    JOIN users u ON u.id = m.uploader_user_id
    WHERE m.status = 'hidden'
    ORDER BY m.created_at DESC
    LIMIT 24
  `).all();

  return [...base, ...(hidden.results ?? [])];
}

export async function hideMediaItem(locals: App.Locals, input: { mediaId: string; actorUserId: string }) {
  const db = getDb(locals);
  await db.batch([
    db.prepare(`UPDATE media_items SET status = 'hidden' WHERE id = ?`).bind(input.mediaId),
    db.prepare(`
      INSERT INTO audit_events (id, actor_user_id, event_type, target_type, target_id, payload_json)
      VALUES (?, ?, 'media_hidden', 'media_item', ?, ?)
    `).bind(createId('audit'), input.actorUserId, input.mediaId, JSON.stringify({ action: 'hide' })),
  ]);
}

export async function unhideMediaItem(locals: App.Locals, input: { mediaId: string; actorUserId: string }) {
  const db = getDb(locals);
  await db.batch([
    db.prepare(`UPDATE media_items SET status = 'ready' WHERE id = ?`).bind(input.mediaId),
    db.prepare(`
      INSERT INTO audit_events (id, actor_user_id, event_type, target_type, target_id, payload_json)
      VALUES (?, ?, 'media_unhidden', 'media_item', ?, ?)
    `).bind(createId('audit'), input.actorUserId, input.mediaId, JSON.stringify({ action: 'unhide' })),
  ]);
}

export async function listCommentsForAdmin(locals: App.Locals, mediaId?: string) {
  const db = getDb(locals);
  const sql = mediaId
    ? `
      SELECT c.id, c.media_item_id, c.body, c.status, c.created_at, u.display_name
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.media_item_id = ?
      ORDER BY c.created_at DESC
      LIMIT 50
    `
    : `
      SELECT c.id, c.media_item_id, c.body, c.status, c.created_at, u.display_name
      FROM comments c
      JOIN users u ON u.id = c.user_id
      ORDER BY c.created_at DESC
      LIMIT 50
    `;

  const query = db.prepare(sql);
  const result = mediaId ? await query.bind(mediaId).all() : await query.all();
  return result.results ?? [];
}

export async function hideComment(locals: App.Locals, input: { commentId: string; actorUserId: string }) {
  const db = getDb(locals);
  await db.batch([
    db.prepare(`UPDATE comments SET status = 'hidden', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(input.commentId),
    db.prepare(`
      INSERT INTO audit_events (id, actor_user_id, event_type, target_type, target_id, payload_json)
      VALUES (?, ?, 'comment_hidden', 'comment', ?, ?)
    `).bind(createId('audit'), input.actorUserId, input.commentId, JSON.stringify({ action: 'hide' })),
  ]);
}

export async function unhideComment(locals: App.Locals, input: { commentId: string; actorUserId: string }) {
  const db = getDb(locals);
  await db.batch([
    db.prepare(`UPDATE comments SET status = 'visible', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(input.commentId),
    db.prepare(`
      INSERT INTO audit_events (id, actor_user_id, event_type, target_type, target_id, payload_json)
      VALUES (?, ?, 'comment_unhidden', 'comment', ?, ?)
    `).bind(createId('audit'), input.actorUserId, input.commentId, JSON.stringify({ action: 'unhide' })),
  ]);
}

export async function updateUserStatus(locals: App.Locals, input: { userId: string; status: 'invited' | 'active' | 'disabled'; actorUserId: string }) {
  const db = getDb(locals);
  await db.batch([
    db.prepare(`UPDATE users SET status = ? WHERE id = ?`).bind(input.status, input.userId),
    db.prepare(`
      INSERT INTO audit_events (id, actor_user_id, event_type, target_type, target_id, payload_json)
      VALUES (?, ?, 'user_status_changed', 'user', ?, ?)
    `).bind(createId('audit'), input.actorUserId, input.userId, JSON.stringify({ status: input.status })),
  ]);
}

export async function deleteComment(locals: App.Locals, input: { commentId: string; actorUserId: string }) {
  const db = getDb(locals);
  await db.batch([
    db.prepare(`DELETE FROM comments WHERE id = ?`).bind(input.commentId),
    db.prepare(`
      INSERT INTO audit_events (id, actor_user_id, event_type, target_type, target_id, payload_json)
      VALUES (?, ?, 'comment_deleted', 'comment', ?, ?)
    `).bind(createId('audit'), input.actorUserId, input.commentId, JSON.stringify({ action: 'delete' })),
  ]);
}

export async function deleteMediaItem(locals: App.Locals, input: { mediaId: string; actorUserId: string }) {
  const db = getDb(locals);
  const media = await db.prepare(`
    SELECT id, storage_key_original, storage_key_preview, storage_key_thumbnail
    FROM media_items
    WHERE id = ?
    LIMIT 1
  `).bind(input.mediaId).first<{ id: string; storage_key_original: string | null; storage_key_preview: string | null; storage_key_thumbnail: string | null }>();

  if (!media) {
    throw new Response(JSON.stringify({ error: 'Media not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  const bucket = getMediaBucket(locals);
  const keys = [media.storage_key_original, media.storage_key_preview, media.storage_key_thumbnail].filter(Boolean) as string[];
  for (const key of keys) {
    await bucket.delete(key);
  }

  await db.batch([
    db.prepare(`DELETE FROM comments WHERE media_item_id = ?`).bind(input.mediaId),
    db.prepare(`DELETE FROM media_items WHERE id = ?`).bind(input.mediaId),
    db.prepare(`
      INSERT INTO audit_events (id, actor_user_id, event_type, target_type, target_id, payload_json)
      VALUES (?, ?, 'media_deleted', 'media_item', ?, ?)
    `).bind(createId('audit'), input.actorUserId, input.mediaId, JSON.stringify({ action: 'delete', deletedKeys: keys.length })),
  ]);
}
