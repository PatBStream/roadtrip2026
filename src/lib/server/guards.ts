export function redirect(path: string, status = 302) {
  return new Response(null, {
    status,
    headers: {
      location: path,
    },
  });
}

export function isPrerenderBuild() {
  return import.meta.env.SSR && !import.meta.env.DEV;
}

export function pageUserOrNull(locals: App.Locals) {
  return locals.user ?? null;
}
