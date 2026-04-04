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
  /** Public Render URL (Dashboard → your Web Service → copy URL, no path). */
  var renderApi = 'https://switch-to-salesforce.onrender.com';
  window.STS_API_ORIGIN = onVercel ? renderApi : 'http://localhost:5050';
})();
