/**
 * API origin for the browser (scheme + host, no trailing slash).
 * - Local dev: default matches backend when the static site is on port 5000 and the API on 5050.
 *   If your API runs on 5000 and the site on 5500, set this to "" or http://localhost:5000.
 * - Production: set at deploy time via `npm run build` and env STS_API_ORIGIN.
 */
window.STS_API_ORIGIN = window.STS_API_ORIGIN || "http://localhost:5050";
