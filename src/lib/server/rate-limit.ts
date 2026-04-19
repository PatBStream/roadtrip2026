import { createId } from './ids';
import { getDb } from './db';
import { sha256Hex } from './crypto';

async function actorKey(request: Request, scope: string) {
  const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? 'unknown';
  return sha256Hex(`${scope}:${ip}`);
}

export async function enforceRateLimit(locals: App.Locals, request: Request, input: { scope: string; limit: number; windowSeconds: number }) {
  const db = getDb(locals);
  const key = await actorKey(request, input.scope);
  const cutoff = new Date(Date.now() - input.windowSeconds * 1000).toISOString();

  const result = await db.prepare(`
    SELECT COUNT(*) AS count
    FROM audit_events
    WHERE event_type = 'rate_limit_hit'
      AND target_type = ?
      AND target_id = ?
      AND datetime(created_at) > datetime(?)
  `).bind(input.scope, key, cutoff).first<{ count: number }>();

  const count = Number(result?.count ?? 0);
  if (count >= input.limit) {
    throw new Response(JSON.stringify({ error: 'Rate limit exceeded. Please wait and try again.' }), {
      status: 429,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  await db.prepare(`
    INSERT INTO audit_events (id, actor_user_id, event_type, target_type, target_id, payload_json)
    VALUES (?, NULL, 'rate_limit_hit', ?, ?, ?)
  `).bind(createId('audit'), input.scope, key, JSON.stringify({ windowSeconds: input.windowSeconds })).run();
}
