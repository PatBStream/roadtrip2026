export const prerender = false;
import type { APIRoute } from 'astro';
import { createInvitedUser, findUserByEmail } from '../../lib/server/users';
import { badRequest, json } from '../../lib/server/http';

export const POST: APIRoute = async ({ request, locals }) => {
  const adminKey = request.headers.get('x-admin-seed-key');

  if (!adminKey || adminKey !== locals.env.SESSION_SECRET) {
    return json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as { email?: string; displayName?: string } | null;
  if (!body?.email || !body.displayName) {
    return badRequest('email and displayName are required');
  }

  const existing = await findUserByEmail(locals, body.email);
  if (existing) {
    return json({ ok: true, existing: true, userId: existing.id });
  }

  const user = await createInvitedUser(locals, {
    email: body.email,
    displayName: body.displayName,
    status: 'invited',
  });

  return json({ ok: true, existing: false, userId: user.id });
};
