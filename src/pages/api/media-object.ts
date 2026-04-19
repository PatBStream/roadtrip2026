export const prerender = false;
import type { APIRoute } from 'astro';
import { getMediaBucket } from '../../lib/server/storage';

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  const width = Number(url.searchParams.get('width') || '0');
  const fit = url.searchParams.get('fit') || 'scale-down';

  if (!key) {
    return new Response('Missing object key', { status: 400 });
  }

  try {
    const bucket = getMediaBucket(locals);
    const object = await bucket.get(key);

    if (!object) {
      return new Response('Not found', { status: 404 });
    }

    if (width > 0 && locals.env.IMAGES && /\.(jpe?g|png|webp|gif|avif|heic)$/i.test(key)) {
      try {
        const image = (locals.env as any).IMAGES as { input: (stream: ReadableStream | null) => { transform: (opts: Record<string, unknown>) => Response } };
        const transformed = image.input(object.body).transform({
          width,
          fit,
        });
        transformed.headers.set('cache-control', 'private, max-age=300');
        return transformed;
      } catch {
        // Fall back to the original object when local preview or runtime image transforms are unavailable.
      }
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
