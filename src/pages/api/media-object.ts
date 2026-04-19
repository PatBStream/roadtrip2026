export const prerender = false;
import type { APIRoute } from 'astro';
import { getMediaBucket } from '../../lib/server/storage';

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!key) {
    return new Response('Missing object key', { status: 400 });
  }

  try {
    const bucket = getMediaBucket(locals);
    const object = await bucket.get(key);

    if (!object) {
      return new Response('Not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'private, max-age=60');

    return new Response(object.body, { headers });
  } catch {
    return new Response('Storage binding not configured', { status: 503 });
  }
};
