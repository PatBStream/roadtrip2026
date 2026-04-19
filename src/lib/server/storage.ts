export function getMediaBucket(locals: App.Locals) {
  const bucket = locals.env.MEDIA_BUCKET;

  if (!bucket) {
    throw new Error('R2 binding MEDIA_BUCKET is not configured');
  }

  return bucket;
}

export function mediaObjectUrl(key: string | null, options?: { width?: number; fit?: 'scale-down' | 'contain' | 'cover' }) {
  if (!key) return null;

  const params = new URLSearchParams({ key });
  if (options?.width) params.set('width', String(options.width));
  if (options?.fit) params.set('fit', options.fit);

  return `/api/media-object?${params.toString()}`;
}

export async function objectExists(locals: App.Locals, key: string) {
  const bucket = getMediaBucket(locals);
  const object = await bucket.head(key);
  return object !== null;
}
