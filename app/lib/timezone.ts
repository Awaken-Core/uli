/**
 * Resolves the UTC offset string (e.g. "+05:30", "-04:00", "+00:00")
 * for an IANA timezone or offset string at a given reference Date.
 */
export function getTimezoneOffsetString(
  timezone?: string,
  referenceDate: Date = new Date()
): string {
  if (!timezone) return "+00:00";
  const trimmed = timezone.trim();

  // If already in offset format: +HH:MM, -HH:MM, +HHMM, -HHMM, Z, UTC
  if (/^[+-]\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  if (/^[+-]\d{4}$/.test(trimmed)) {
    return `${trimmed.slice(0, 3)}:${trimmed.slice(3)}`;
  }
  if (trimmed.toUpperCase() === "Z" || trimmed.toUpperCase() === "UTC") {
    return "+00:00";
  }

  // Treat as IANA timezone (e.g. "Asia/Kolkata", "America/New_York")
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: trimmed,
      timeZoneName: "longOffset",
    });
    const parts = formatter.formatToParts(referenceDate);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    if (tzPart && tzPart.value.startsWith("GMT")) {
      const offset = tzPart.value.replace("GMT", "");
      return offset === "" ? "+00:00" : offset;
    }
  } catch {
    // Fallback if invalid timezone string is provided
  }

  return "+00:00";
}

/**
 * Returns YYYY-MM-DD representing "today" in the specified timezone.
 */
export function getTodayInTimezone(timezone?: string): string {
  if (!timezone) return new Date().toISOString().split("T")[0];
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone.trim(),
    });
    return formatter.format(new Date());
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

/**
 * Computes the exact UTC Date objects for start of day (00:00:00.000)
 * and end of day (23:59:59.999) for a YYYY-MM-DD date in a given timezone.
 */
export function getStartAndEndOfDayInTimezone(
  dateStr: string,
  timezone?: string
): { startOfDay: Date; endOfDay: Date } {
  const roughNoon = new Date(`${dateStr}T12:00:00.000Z`);
  const offset = getTimezoneOffsetString(timezone, roughNoon);
  const startOfDay = new Date(`${dateStr}T00:00:00.000${offset}`);
  const endOfDay = new Date(`${dateStr}T23:59:59.999${offset}`);
  return { startOfDay, endOfDay };
}
