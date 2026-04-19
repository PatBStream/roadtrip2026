export type SessionUser = {
  id: string;
  displayName: string;
  role: 'owner' | 'member' | 'moderator';
};

export async function getSessionUser(_context: { locals: App.Locals }): Promise<SessionUser | null> {
  return _context.locals.user ?? null;
}

export function requireUser(context: { locals: App.Locals }): asserts context is { locals: App.Locals & { user: SessionUser } } {
  if (!context.locals.user) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: {
        'content-type': 'application/json; charset=utf-8',
      },
    });
  }
}
