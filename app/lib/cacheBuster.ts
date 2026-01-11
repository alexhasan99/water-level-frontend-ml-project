export function fourHourBucket(): number {
  const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
  return Math.floor(Date.now() / FOUR_HOURS_MS);
}

export function withFourHourCache(url: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${fourHourBucket()}`;
}
