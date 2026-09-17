/** Префикс base-пути: сайт живёт в подпапке на GitHub Pages. */
export function u(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return path.startsWith('/') ? `${base}${path}` : path;
}
