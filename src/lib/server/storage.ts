export function getMediaBucket(locals: App.Locals) {
  const bucket = locals.env.MEDIA_BUCKET;

  if (!bucket) {
    throw new Error('R2 binding MEDIA_BUCKET is not configured');
  }

  return bucket;
}

export function mediaObjectUrl(key: string | null) {
  if (!key) return null;
  return `/api/media-object?key=${encodeURIComponent(key)}`;
}

export async function objectExists(locals: App.Locals, key: string) {
  const bucket = getMediaBucket(locals);
  const object = await bucket.head(key);
  return object !== null;
}
