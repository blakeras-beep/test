const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 4173;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
};

function sendNotFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
  res.end('Not found');
}

function sendServerError(res, error) {
  res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
  res.end(error?.message || 'Internal server error');
}

function createServer() {
  return http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    const safePath = path.normalize(parsedUrl.pathname).replace(/^\/+/, '');
    let filePath = path.join(BASE_DIR, safePath);

    if (parsedUrl.pathname === '/' || parsedUrl.pathname === '') {
      filePath = path.join(BASE_DIR, 'index.html');
    }

    if (!filePath.startsWith(BASE_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return sendNotFound(res);
        }
        return sendServerError(res, err);
      }

      let streamPath = filePath;
      if (stats.isDirectory()) {
        streamPath = path.join(filePath, 'index.html');
      }

      const ext = path.extname(streamPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      const readStream = fs.createReadStream(streamPath);
      readStream.on('error', (streamErr) => sendServerError(res, streamErr));
      readStream.pipe(res);
    });
  });
}

if (require.main === module) {
  createServer().listen(PORT, () => {
    console.log(`MarketField running at http://localhost:${PORT}`);
  });
}

module.exports = { createServer };
