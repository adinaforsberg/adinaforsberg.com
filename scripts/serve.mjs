#!/usr/bin/env node
// Local preview of public/ that behaves like GitHub Pages:
//   /about -> about.html, /home/ -> home/index.html, unknown -> 404.html,
//   and byte-range requests so audio players can seek.
// Usage: node scripts/serve.mjs [--open] [--port 4000]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".txt": "text/plain; charset=utf-8",
};

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function resolveFile(urlPath) {
  let rel;
  try {
    rel = decodeURIComponent(urlPath.split("?")[0]);
  } catch {
    return null;
  }
  const full = path.join(ROOT, path.normalize(rel));
  if (full !== ROOT && !full.startsWith(ROOT + path.sep)) return null;
  return [full, full + ".html", path.join(full, "index.html")].find(isFile) ?? null;
}

function send(req, res, file, status = 200) {
  const size = fs.statSync(file).size;
  const headers = {
    "Content-Type": TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream",
    "Accept-Ranges": "bytes",
    "Cache-Control": "no-store", // always show the latest edit on refresh
  };
  const range = status === 200 && /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "");
  if (range) {
    let start = range[1] === "" ? size - Number(range[2]) : Number(range[1]);
    let end = range[1] !== "" && range[2] !== "" ? Number(range[2]) : size - 1;
    start = Math.max(0, start);
    end = Math.min(end, size - 1);
    if (start > end) {
      res.writeHead(416, { "Content-Range": `bytes */${size}` }).end();
      return;
    }
    res.writeHead(206, { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": end - start + 1 });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(file, { start, end }).pipe(res);
    return;
  }
  res.writeHead(status, { ...headers, "Content-Length": size });
  if (req.method === "HEAD") return res.end();
  fs.createReadStream(file).pipe(res);
}

export function startServer(port = 4000) {
  const server = http.createServer((req, res) => {
    const file = resolveFile(req.url);
    const [pathname, query] = req.url.split(/\?(.*)/s);
    // Like GitHub Pages, /dir -> /dir/ so relative links inside dir/index.html work.
    if (file && file.endsWith(path.sep + "index.html") && !pathname.endsWith("/")) {
      res.writeHead(301, { Location: pathname + "/" + (query ? "?" + query : "") }).end();
      return;
    }
    if (file) return send(req, res, file);
    send(req, res, path.join(ROOT, "404.html"), 404);
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const portArg = args.indexOf("--port");
  const port = portArg >= 0 ? Number(args[portArg + 1]) : Number(process.env.PORT) || 4000;
  try {
    await startServer(port);
  } catch (err) {
    if (err.code === "EADDRINUSE") {
      console.log(`The preview is already running at http://localhost:${port}`);
      if (args.includes("--open")) exec(`open http://localhost:${port}`);
      process.exit(0);
    }
    throw err;
  }
  const url = `http://localhost:${port}`;
  console.log(`Previewing the site at ${url}  (edits show up when you refresh; Ctrl+C to stop)`);
  if (args.includes("--open")) exec(`open ${url}`);
}
