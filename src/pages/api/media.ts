export const prerender = false;
import type { APIRoute } from 'astro';
import { listRecentMedia } from '../../lib/server/db';
import { mediaObjectUrl } from '../../lib/server/storage';
import { json } from '../../lib/server/http';

export const GET: APIRoute = async ({ locals }) => {
  const rows = await listRecentMedia(locals).catch(() => []);
  const items = rows.map((row: any) => ({
    id: row.id,
    type: row.type,
    caption: row.caption,
    tripDay: row.trip_day,
    thumbnailUrl: mediaObjectUrl(row.storage_key_thumbnail),
    previewUrl: mediaObjectUrl(row.storage_key_preview),
    originalUrl: mediaObjectUrl(row.storage_key_original),
    createdAt: row.created_at,
    uploaderName: row.display_name,
    commentCount: Number(row.comment_count ?? 0),
  }));

  return json({ items });
};
