/**
 * React escapes all JSX text content by default, so plain strings rendered as
 * {value} can't inject HTML. The two gaps that escaping alone doesn't cover:
 * 1) URLs used in href/src — a javascript-scheme URL still executes on click.
 * 2) Stored garbage — control characters, unbounded length, stray whitespace.
 * These helpers close both at the point data is written, not at render time.
 */

const SAFE_PROTOCOLS = new Set(["http:", "https:"]);

// Strips ASCII control characters, keeping ordinary tab, newline, and carriage return.
function stripControlChars(input: string): string {
  let out = "";
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    const keepWhitespace = code === 9 || code === 10 || code === 13;
    const isControl = (code <= 31 && !keepWhitespace) || code === 127;
    if (!isControl) out += input[i];
  }
  return out;
}

export function cleanText(input: unknown, maxLength = 2000): string {
  if (typeof input !== "string") return "";
  return stripControlChars(input).trim().slice(0, maxLength);
}

export function isSafeUrl(input: string): boolean {
  try {
    return SAFE_PROTOCOLS.has(new URL(input.trim()).protocol);
  } catch {
    return false;
  }
}
