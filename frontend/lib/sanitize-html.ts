/**
 * Defensive HTML sanitizer for user-controlled email and message bodies.
 * Strips executable scripts, dangerous elements, inline event handlers,
 * and malicious protocol schemes (javascript:, vbscript:, data:text/html)
 * to prevent Stored Cross-Site Scripting (XSS).
 */
export function sanitizeHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== "string") return "";

  let clean = rawHtml;

  // 1. Remove script tags and everything inside them
  clean = clean.replace(/<script\b[\s\S]*?<\/script\s*>/gi, "");

  // 2. Remove dangerous executable/embedding elements
  clean = clean.replace(/<\/?(?:applet|embed|object|frameset|frame|iframe|meta|link|base|form|input|button)\b[^>]*>/gi, "");

  // 3. Remove all inline event handlers (e.g., onload, onerror, onclick, onmouseover, onfocus, etc.)
  clean = clean.replace(/\s+on[a-zA-Z0-9_-]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "");

  // 4. Neutralize javascript:, vbscript:, and data:text/html URIs in href, src, and other attributes
  clean = clean.replace(
    /\b(href|src|action|formaction|poster|background)\s*=\s*(['"]?)\s*(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/gi,
    'data-blocked="true" $1=$2unsafe:'
  );

  // 5. Neutralize CSS expressions, javascript: URLs, or behaviors inside style attributes
  clean = clean.replace(/style\s*=\s*(['"])([\s\S]*?)\1/gi, (match, quote, styleContent) => {
    if (/expression|behavior|javascript\s*:|url\s*\(\s*['"]?\s*javascript/i.test(styleContent)) {
      return 'style=""';
    }
    return match;
  });

  return clean;
}
