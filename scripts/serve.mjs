import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../dist/",import.meta.url));
const types={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".json":"application/json",".pdf":"application/pdf"};
const server=http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,"http://127.0.0.1");
    const relative=decodeURIComponent(url.pathname).replace(/^\/+/,"")||"index.html";
    const file=path.resolve(root,relative);
    if(!file.startsWith(root)) {res.writeHead(403).end();return;}
    const body=await readFile(file);
    res.writeHead(200,{"Content-Type":types[path.extname(file)]??"application/octet-stream","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}).end(body);
  } catch {res.writeHead(404,{"Content-Type":"text/plain"}).end("Not found");}
});
server.listen(4173,"127.0.0.1",()=>console.log("Portfolio preview: http://127.0.0.1:4173"));
