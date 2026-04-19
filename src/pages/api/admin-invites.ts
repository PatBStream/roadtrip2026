export const prerender = false;
import type { APIRoute } from 'astro';
import { badRequest, json } from '../../lib/server/http';
import { createInvite, listUsers, requireOwner } from '../../lib/server/admin';

export const GET: APIRoute = async ({ locals }) => {
  requireOwner(locals);
  const users = await listUsers(locals);
  return json({ users });
};

export const POST: APIRoute = async ({ request, locals }) => {
  requireOwner(locals);

  const body = await request.json().catch(() => null) as {
    email?: string;
    displayName?: string;
    role?: 'owner' | 'member' | 'moderator';
  } | null;

  if (!body?.email || !body.displayName) {
    return badRequest('email and displayName are required');
  }

  const result = await createInvite(locals, {
    email: body.email.trim(),
    displayName: body.displayName.trim(),
    role: body.role ?? 'member',
  });

  return json({ ok: true, ...result });
};
