import { getDb } from './db';

export async function getMediaById(locals: App.Locals, mediaId: string) {
  const db = getDb(locals);
  return db.prepare(`
    SELECT
      m.id,
      m.type,
      m.caption,
      m.trip_day,
      m.storage_key_original,
      m.storage_key_preview,
      m.storage_key_thumbnail,
      m.created_at,
      u.display_name
    FROM media_items m
    JOIN users u ON u.id = m.uploader_user_id
    WHERE m.id = ?
    LIMIT 1
  `).bind(mediaId).first<any>();
}
