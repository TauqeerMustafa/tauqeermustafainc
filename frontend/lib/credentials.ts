/**
 * First-sign-in credentials, generated in the browser.
 *
 * The admin never invents a password: the account is created with one of these,
 * it is mailed to the new hire's personal address in the same request, and the
 * API hashes it immediately — so this is the only moment it exists in the clear.
 * Shared by the single "Add user" drawer and the bulk onboarding run so the two
 * cannot drift into different strength rules.
 */

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const SYMBOLS = "!@#$%&*?";

/**
 * A password nobody had to invent. Ambiguous glyphs (O/0, l/1) are left out
 * because this gets read off a screen and typed by hand at least once.
 */
export function generatePassword(): string {
  const bytes = new Uint32Array(14);
  crypto.getRandomValues(bytes);
  const core = Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
  const tail = SYMBOLS[bytes[0] % SYMBOLS.length];
  return `${core}${tail}`;
}
