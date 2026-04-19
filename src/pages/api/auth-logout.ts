export const prerender = false;
import type { APIRoute } from 'astro';
import { clearSessionCookie, SESSION_COOKIE } from '../../lib/server/session';
import { getDb } from '../../lib/server/db';
import { json } from '../../lib/server/http';
import { sha256Hex } from '../../lib/server/crypto';

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

export const POST: APIRoute = async ({ request, locals }) => {
  const token = getCookieValue(request.headers.get('cookie'), SESSION_COOKIE);

  if (token) {
    const tokenHash = await sha256Hex(`${locals.env.SESSION_SECRET}:${token}`);
    await getDb(locals).prepare(`DELETE FROM sessions WHERE token_hash = ?`).bind(tokenHash).run().catch(() => null);
  }

  return json({ ok: true }, {
    headers: {
      'set-cookie': clearSessionCookie(request),
    },
  });
};
