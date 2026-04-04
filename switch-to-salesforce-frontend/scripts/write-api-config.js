/**
 * Writes js/config.js from env STS_API_ORIGIN (used by Vercel/Netlify CI).
 * Example: STS_API_ORIGIN=https://your-api.onrender.com npm run build
 */
const fs = require("fs");
const path = require("path");

const origin = (process.env.STS_API_ORIGIN || "").trim().replace(/\/$/, "");
const outPath = path.join(__dirname, "..", "js", "config.js");
const body = `/* Generated at deploy — ${new Date().toISOString()} */
window.STS_API_ORIGIN = ${JSON.stringify(origin)};
`;

fs.writeFileSync(outPath, body, "utf8");
console.log("config.js:", origin || "(empty → localhost:5050 in api.js for dev builds)");
