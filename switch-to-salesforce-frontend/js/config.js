/**
 * API origin (scheme + host, no trailing slash).
 * - Vercel (*.vercel.app): defaults to Render API below (edit if your Render service name differs).
 * - Local: http://localhost:5050
 * - Override: set env STS_API_ORIGIN at build (see npm run build) or window.STS_API_ORIGIN before this script.
 */
(function () {
  if (window.STS_API_ORIGIN) {
    return;
  }
  var h = typeof location !== 'undefined' ? location.hostname : '';
  var onVercel = h.indexOf('vercel.app') !== -1;
  /** Must match your Render Web Service URL (see render.yaml name: switch-to-salesforce-api). */
  var renderApi = 'https://switch-to-salesforce-api.onrender.com';
  window.STS_API_ORIGIN = onVercel ? renderApi : 'http://localhost:5050';
})();
