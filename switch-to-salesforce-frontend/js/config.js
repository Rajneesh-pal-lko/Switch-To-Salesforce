/**
 * API origin for the browser (scheme + host, no trailing slash).
 * - Local dev: leave as-is; api.js falls back to http://localhost:5000
 * - Production: set at deploy time via `npm run build` and env STS_API_ORIGIN,
 *   or edit this file once to your live API URL.
 */
window.STS_API_ORIGIN = window.STS_API_ORIGIN || "";
