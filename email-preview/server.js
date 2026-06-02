const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3333;
const dir = __dirname;
http.createServer((req, res) => {
  let file = req.url === '/' ? '/index.html' : req.url;
  const fp = path.join(dir, file);
  if (fs.existsSync(fp)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(fp));
  } else { res.writeHead(404); res.end('Not found'); }
}).listen(PORT, () => console.log(`Email preview at http://localhost:${PORT}`));
