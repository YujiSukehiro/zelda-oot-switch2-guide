import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '..', 'dist');

const HOST = '127.0.0.1';
const ROOT_PORT = Number(process.env.ROOT_PORT || 4173);
const SUBPATH_PORT = Number(process.env.SUBPATH_PORT || 4174);
const SUBPATH_PREFIX = '/Zelda';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

/**
 * Safely resolves a URL sub-pathname (starting with '/') inside DIST_DIR.
 * Returns null if path traversal is attempted or file does not exist.
 */
function resolveDistFile(subPathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(subPathname);
  } catch {
    return null;
  }

  const normalizedRel = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const candidate = path.resolve(DIST_DIR, normalizedRel);

  // Guard against directory traversal outside dist/
  if (candidate !== DIST_DIR && !candidate.startsWith(`${DIST_DIR}${path.sep}`)) {
    return null;
  }

  if (!fs.existsSync(candidate)) {
    return null;
  }

  const stat = fs.statSync(candidate);
  if (stat.isDirectory()) {
    const indexCandidate = path.join(candidate, 'index.html');
    if (fs.existsSync(indexCandidate) && fs.statSync(indexCandidate).isFile()) {
      return indexCandidate;
    }
    return null;
  }

  return stat.isFile() ? candidate : null;
}

function sendFile(req, res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const stat = fs.statSync(filePath);

  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': stat.size,
    'Cache-Control': 'no-cache',
  });

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end('Internal Server Error');
  });
  stream.pipe(res);
}

function sendNotFound(req, res, message) {
  const body = `${message}\n`;
  res.writeHead(404, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-cache',
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  res.end(body);
}

// 1. Port 4173 — Strict Firebase Hosting Root Server ('/')
const rootServer = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  const url = new URL(req.url || '/', `http://${HOST}:${ROOT_PORT}`);
  const filePath = resolveDistFile(url.pathname);
  if (!filePath) {
    sendNotFound(req, res, `404 Not Found on root server: ${url.pathname}`);
    return;
  }
  sendFile(req, res, filePath);
});

// 2. Port 4174 — Strict GitHub Pages Subpath Server ('/Zelda/' ONLY; 404 everywhere else)
const subpathServer = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  const url = new URL(req.url || '/', `http://${HOST}:${SUBPATH_PORT}`);
  const { pathname, search } = url;

  // Standard GitHub Pages directory trailing-slash redirect: /Zelda -> /Zelda/
  if (pathname === SUBPATH_PREFIX) {
    res.writeHead(301, { Location: `${SUBPATH_PREFIX}/${search}` });
    res.end();
    return;
  }

  // Strictly reject ANY root-escaped request outside /Zelda/* with HTTP 404
  if (!pathname.startsWith(`${SUBPATH_PREFIX}/`)) {
    sendNotFound(
      req,
      res,
      `404 Not Found (escaped ${SUBPATH_PREFIX}/ subpath scope): ${pathname}`,
    );
    return;
  }

  const strippedPath = pathname.slice(SUBPATH_PREFIX.length) || '/';
  const filePath = resolveDistFile(strippedPath);
  if (!filePath) {
    sendNotFound(req, res, `404 Not Found inside ${SUBPATH_PREFIX}/: ${pathname}`);
    return;
  }
  sendFile(req, res, filePath);
});

function startServers() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`[serve-dual] Error: dist directory not found at ${DIST_DIR}. Run "npm run build" first.`);
    process.exit(1);
  }

  let readyCount = 0;
  const onListening = () => {
    readyCount += 1;
    if (readyCount === 2) {
      console.log(
        `[serve-dual] Ready:\n` +
          `  • Firebase Root:        http://${HOST}:${ROOT_PORT}/\n` +
          `  • GitHub Pages Subpath: http://${HOST}:${SUBPATH_PORT}${SUBPATH_PREFIX}/`,
      );
    }
  };

  rootServer.listen(ROOT_PORT, HOST, onListening);
  subpathServer.listen(SUBPATH_PORT, HOST, onListening);

  const shutdown = () => {
    rootServer.close(() => {
      subpathServer.close(() => {
        process.exit(0);
      });
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServers();
