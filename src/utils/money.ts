/**
 * The API speaks integer kobo everywhere. Convert only at the render boundary.
 */
export const KOBO_PER_NAIRA = 100;

export function formatNaira(kobo: number | null | undefined) {
  const value = (kobo ?? 0) / KOBO_PER_NAIRA;
  return `₦${value.toLocaleString("en-NG", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
