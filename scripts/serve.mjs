import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
export const publicRoot = path.join(projectRoot, 'public');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.otf':'font/otf'};

export async function startServer({ port = 0, handle } = {}) {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (handle && await handle(req, res, url)) return;
      if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
      const pathname = decodeURIComponent(url.pathname);
      const target = path.resolve(publicRoot, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!target.startsWith(publicRoot + path.sep)) { res.writeHead(403).end(); return; }
      const data = await fs.readFile(target);
      res.writeHead(200, {'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store'});
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch { res.writeHead(404).end('Not found'); }
  });
  await new Promise((resolve, reject) => {server.once('error', reject); server.listen(port, '127.0.0.1', resolve);});
  return {server, origin: `http://127.0.0.1:${server.address().port}`};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { origin } = await startServer({port: Number(process.env.PORT || 8765)});
  console.log(`打开 ${origin}，按 Ctrl+C 停止。`);
}
