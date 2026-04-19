import { createId } from './ids';
import { getDb } from './db';

export async function listComments(locals: App.Locals, mediaId: string) {
  const db = getDb(locals);
  const result = await db.prepare(`
    SELECT c.id, c.body, c.created_at, u.display_name
    FROM comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.media_item_id = ? AND c.status = 'visible'
    ORDER BY c.created_at ASC
  `).bind(mediaId).all();

  return result.results ?? [];
}

export async function createComment(locals: App.Locals, input: { mediaId: string; userId: string; body: string }) {
  const db = getDb(locals);
  const id = createId('comment');

  await db.prepare(`
    INSERT INTO comments (id, media_item_id, user_id, body, status)
    VALUES (?, ?, ?, ?, 'visible')
  `).bind(id, input.mediaId, input.userId, input.body).run();

  return { id };
}
