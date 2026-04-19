import type { MiddlewareHandler } from 'astro';
import { env } from 'cloudflare:workers';
import { SESSION_COOKIE, getUserFromSessionToken } from './lib/server/session';

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(';')) {
    const [cookieName, ...rest] = part.trim().split('=');
    if (cookieName === name) {
      return rest.join('=') || null;
    }
  }

  return null;
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  context.locals.env = env as AppBindings;

  const token = getCookieValue(context.request.headers.get('cookie'), SESSION_COOKIE);
  context.locals.user = await getUserFromSessionToken(context.locals, token);

  return next();
};
