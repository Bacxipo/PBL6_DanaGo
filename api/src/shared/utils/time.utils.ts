export function timeToMinutes(value?: string): number | null {
  const match = value?.trim().match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;

  return Number(match[1]) * 60 + Number(match[2]);
}
