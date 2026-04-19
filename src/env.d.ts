/// <reference types="astro/client" />

type AppBindings = {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  SESSION_SECRET: string;
};

declare namespace App {
  interface Locals {
    user: {
      id: string;
      displayName: string;
      role: 'owner' | 'member' | 'moderator';
    } | null;
    env: AppBindings;
  }
}
