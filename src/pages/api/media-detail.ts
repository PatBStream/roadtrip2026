export const prerender = false;
import type { APIRoute } from 'astro';
import { getDb } from '../../lib/server/db';
import { mediaObjectUrl } from '../../lib/server/storage';
import { badRequest, json } from '../../lib/server/http';

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const mediaId = url.searchParams.get('mediaId');

  if (!mediaId) {
    return badRequest('mediaId is required');
  }

  const db = getDb(locals);
  const item = await db.prepare(`
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

  if (!item) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'content-type': 'application/json; charset=utf-8' } });
  }

  return json({
    item: {
      id: item.id,
      type: item.type,
      caption: item.caption,
      tripDay: item.trip_day,
      originalUrl: mediaObjectUrl(item.storage_key_original),
      previewUrl: mediaObjectUrl(item.storage_key_preview),
      thumbnailUrl: mediaObjectUrl(item.storage_key_thumbnail),
      createdAt: item.created_at,
      uploaderName: item.display_name,
    },
  });
};
