export const prerender = false;
import type { APIRoute } from 'astro';
import { requireOwner, listAdminMedia } from '../../lib/server/admin';
import { json } from '../../lib/server/http';
import { mediaObjectUrl } from '../../lib/server/storage';

export const GET: APIRoute = async ({ locals }) => {
  requireOwner(locals);
  const rows = await listAdminMedia(locals);
  const items = rows.map((row: any) => ({
    id: row.id,
    type: row.type,
    caption: row.caption,
    tripDay: row.trip_day,
    status: row.status ?? 'ready',
    thumbnailUrl: row.type === 'image' ? mediaObjectUrl(row.storage_key_original, { width: 320, fit: 'cover' }) : mediaObjectUrl(row.storage_key_thumbnail),
    previewUrl: row.type === 'image' ? mediaObjectUrl(row.storage_key_original, { width: 1200, fit: 'scale-down' }) : mediaObjectUrl(row.storage_key_preview),
    originalUrl: mediaObjectUrl(row.storage_key_original),
    createdAt: row.created_at,
    uploaderName: row.display_name,
    commentCount: Number(row.comment_count ?? 0),
  }));

  return json({ items });
};
