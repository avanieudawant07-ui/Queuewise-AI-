import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDist = path.resolve(__dirname, "../frontend/dist");
const backendDist = path.resolve(__dirname, "dist");

// Ensure backend/dist exists
if (!fs.existsSync(backendDist)) {
  fs.mkdirSync(backendDist, { recursive: true });
}

// Copy frontend dist assets if present
if (fs.existsSync(frontendDist)) {
  fs.cpSync(frontendDist, backendDist, { recursive: true });
  console.log("Copied frontend/dist assets into backend/dist");
}

// Serverless Node.js entrypoint handler
const handlerCode = `import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import app from "../src/app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let indexHtml = "";
try {
  indexHtml = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");
} catch (e) {
  try {
    indexHtml = fs.readFileSync(path.join(__dirname, "../dist/index.html"), "utf-8");
  } catch (err) {}
}

export default function handler(req, res) {
  const url = req.url || "/";
  const cleanUrl = url.split("?")[0];

  // Static assets
  if (cleanUrl.startsWith("/assets/")) {
    const assetPath = path.join(__dirname, cleanUrl);
    if (fs.existsSync(assetPath)) {
      if (cleanUrl.endsWith(".css")) res.setHeader("Content-Type", "text/css");
      if (cleanUrl.endsWith(".js")) res.setHeader("Content-Type", "application/javascript");
      return res.end(fs.readFileSync(assetPath));
    }
  }

  // Favicon
  if (cleanUrl === "/favicon.svg") {
    const favPath = path.join(__dirname, "favicon.svg");
    if (fs.existsSync(favPath)) {
      res.setHeader("Content-Type", "image/svg+xml");
      return res.end(fs.readFileSync(favPath));
    }
  }

  // API and health endpoints
  if (cleanUrl.startsWith("/api") || cleanUrl.startsWith("/health")) {
    return app(req, res);
  }

  // SPA fallback for all website routes
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.end(indexHtml);
}
`;

fs.writeFileSync(path.join(backendDist, "index.js"), handlerCode, "utf-8");
fs.writeFileSync(path.join(backendDist, "app.js"), `export { default } from "./index.js";\n`, "utf-8");

console.log("Successfully created backend/dist/index.js and backend/dist/app.js entrypoints for Vercel.");
