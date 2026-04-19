import { createId } from './ids';
import { sha256Hex } from './crypto';
import { getDb } from './db';

export async function findUserByEmail(locals: App.Locals, email: string) {
  const db = getDb(locals);
  return db.prepare(`
    SELECT id, email, display_name, role, status
    FROM users
    WHERE lower(email) = lower(?)
    LIMIT 1
  `).bind(email).first<{ id: string; email: string; display_name: string; role: 'owner' | 'member' | 'moderator'; status: string }>();
}

export async function createInvitedUser(locals: App.Locals, input: { email: string; displayName: string; role?: 'owner' | 'member' | 'moderator'; status?: 'invited' | 'active' }) {
  const db = getDb(locals);
  const id = createId('user');

  await db.prepare(`
    INSERT INTO users (id, email, display_name, role, status)
    VALUES (?, ?, ?, ?, ?)
  `).bind(id, input.email, input.displayName, input.role ?? 'member', input.status ?? 'invited').run();

  return { id, ...input };
}

export async function redeemInvite(locals: App.Locals, email: string, displayName?: string) {
  const existing = await findUserByEmail(locals, email);

  if (!existing) {
    throw new Error('No invite exists for this email');
  }

  if (existing.status === 'disabled') {
    throw new Error('This invite is disabled');
  }

  await getDb(locals).prepare(`
    UPDATE users
    SET status = 'active',
        display_name = COALESCE(?, display_name),
        last_seen_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(displayName ?? null, existing.id).run();

  return {
    id: existing.id,
    displayName: displayName ?? existing.display_name,
    role: existing.role,
  };
}

export async function makeInviteCode(email: string, secret: string) {
  const normalized = email.trim().toLowerCase();
  const hash = await sha256Hex(`${secret}:${normalized}`);
  return hash.slice(0, 12);
}
