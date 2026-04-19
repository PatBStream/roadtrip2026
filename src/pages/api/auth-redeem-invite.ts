export const prerender = false;
import type { APIRoute } from 'astro';
import { redeemInvite } from '../../lib/server/users';
import { buildSessionCookie, createSession } from '../../lib/server/session';
import { badRequest, json } from '../../lib/server/http';

export const POST: APIRoute = async ({ request, locals }) => {
  const body = await request.json().catch(() => null) as { email?: string; displayName?: string } | null;

  if (!body?.email) {
    return badRequest('Email is required');
  }

  try {
    const user = await redeemInvite(locals, body.email, body.displayName);
    const session = await createSession(locals, { id: user.id }, request);

    return json({ user }, {
      headers: {
        'set-cookie': buildSessionCookie(session.token, session.expiresAt, request),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invite redemption failed';
    return json({ error: message }, { status: 403 });
  }
};
