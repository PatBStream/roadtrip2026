export function getDb(locals: App.Locals) {
  const db = locals.env.DB;

  if (!db) {
    throw new Error('D1 binding DB is not configured');
  }

  return db;
}

export async function listRecentMedia(locals: App.Locals) {
  const db = getDb(locals);
  const result = await db.prepare(`
    SELECT
      m.id,
      m.type,
      m.caption,
      m.trip_day,
      m.storage_key_original,
      m.storage_key_thumbnail,
      m.storage_key_preview,
      m.created_at,
      u.display_name,
      COUNT(c.id) AS comment_count
    FROM media_items m
    JOIN users u ON u.id = m.uploader_user_id
    LEFT JOIN comments c ON c.media_item_id = m.id AND c.status = 'visible'
    WHERE m.status = 'ready'
    GROUP BY
      m.id,
      m.type,
      m.caption,
      m.trip_day,
      m.storage_key_original,
      m.storage_key_thumbnail,
      m.storage_key_preview,
      m.created_at,
      u.display_name
    ORDER BY m.created_at DESC
    LIMIT 24
  `).all();

  return result.results ?? [];
}
