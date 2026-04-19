export function createId(prefix: string) {
  const random = crypto.randomUUID().replace(/-/g, '');
  return `${prefix}_${random}`;
}
