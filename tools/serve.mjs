import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.cwd(),process.argv[2]||'.');
const port=Number(process.argv[3]||4173);
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.glb':'model/gltf-binary'};
http.createServer((req,res)=>{
  let url; try {url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);} catch {res.writeHead(400);return res.end();}
  if (url.includes('..') || /(?:supa\.txt|\.blend|^\/\.|^\/supabase\/|^\/tools\/)/.test(url)) {res.writeHead(404);return res.end();}
  let file=path.join(root,url==='/'?'index.html':url);
  if(!fs.existsSync(file)||fs.statSync(file).isDirectory()) file=path.join(root,'index.html');
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});
  fs.createReadStream(file).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
