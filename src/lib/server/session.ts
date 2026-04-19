import { createId } from './ids';
import { sha256Hex, signToken } from './crypto';
import { getDb } from './db';

export const SESSION_COOKIE = 'roadtrip2026_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;

export async function createSession(locals: App.Locals, user: { id: string }, request: Request) {
  const db = getDb(locals);
  const sessionId = createId('sess');
  const rawToken = crypto.randomUUID() + crypto.randomUUID();
  const tokenHash = await signToken(locals.env.SESSION_SECRET, rawToken);
  const now = Date.now();
  const expiresAt = new Date(now + SESSION_TTL_MS).toISOString();
  const ip = request.headers.get('cf-connecting-ip') ?? '';
  const userAgent = request.headers.get('user-agent') ?? '';
  const ipHash = ip ? await sha256Hex(ip) : null;

  await db.prepare(`
    INSERT INTO sessions (id, user_id, token_hash, expires_at, ip_hash, user_agent)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(sessionId, user.id, tokenHash, expiresAt, ipHash, userAgent).run();

  return {
    token: rawToken,
    expiresAt,
  };
}

export async function getUserFromSessionToken(locals: App.Locals, token: string | null) {
  if (!token) return null;

  const db = getDb(locals);
  const tokenHash = await signToken(locals.env.SESSION_SECRET, token);

  const result = await db.prepare(`
    SELECT u.id, u.display_name, u.role
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ?
      AND u.status = 'active'
      AND datetime(s.expires_at) > datetime('now')
    LIMIT 1
  `).bind(tokenHash).first<{ id: string; display_name: string; role: 'owner' | 'member' | 'moderator' }>();

  if (!result) return null;

  return {
    id: result.id,
    displayName: result.display_name,
    role: result.role,
  };
}

function isSecureRequest(request: Request) {
  const url = new URL(request.url);
  if (url.protocol === 'https:') return true;

  const forwardedProto = request.headers.get('x-forwarded-proto');
  return forwardedProto === 'https';
}

export function buildSessionCookie(token: string, expiresAt: string, request: Request) {
  const secure = isSecureRequest(request) ? '; Secure' : '';
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax${secure}; Expires=${new Date(expiresAt).toUTCString()}`;
}

export function clearSessionCookie(request: Request) {
  const secure = isSecureRequest(request) ? '; Secure' : '';
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax${secure}; Expires=${new Date(0).toUTCString()}`;
}
