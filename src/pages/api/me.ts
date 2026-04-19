export const prerender = false;
import type { APIRoute } from 'astro';
import { getSessionUser } from '../../lib/server/auth';
import { json } from '../../lib/server/http';

export const GET: APIRoute = async ({ locals }) => {
  const user = await getSessionUser({ locals });
  return json({ user });
};
