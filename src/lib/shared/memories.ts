export const MEMORY_NAV_LABEL = 'Memories';

export const uploadConstraints = {
  batch: {
    maxImageCount: 10,
  },
  image: {
    maxBytes: 20 * 1024 * 1024,
    acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  },
  video: {
    maxBytes: 250 * 1024 * 1024,
    maxDurationSeconds: 60,
    acceptedMimeTypes: ['video/mp4', 'video/quicktime'],
  },
  comment: {
    maxLength: 1000,
  },
  rateLimit: {
    signInPerMinute: 8,
    uploadCreatePerMinute: 20,
    uploadPutPerMinute: 20,
    commentPostPerMinute: 20,
  },
} as const;

export type MediaType = 'image' | 'video';

export type MemoryFeedItem = {
  id: string;
  type: MediaType;
  caption: string | null;
  tripDay: number | null;
  thumbnailUrl: string | null;
  previewUrl: string | null;
  createdAt: string;
  uploaderName: string;
  commentCount: number;
};
