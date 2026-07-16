/**
 * Kenya observes no daylight saving time, so as long as the process runs with
 * TZ=Africa/Nairobi, native Date local getters already reflect Nairobi wall-clock time.
 */
function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function nairobiDateString(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function nairobiTimeString(date: Date = new Date()): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
