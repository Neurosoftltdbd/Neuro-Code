import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyList = ['326546', '543214', '987658', '948564'];

const server = http.createServer(function(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const key = url.searchParams.get('key');

    if (keyList.includes(key)) {
        const filePath = path.join(__dirname, 'IVAC.js');
        fs.createReadStream(filePath)
            .on('error', () => {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('File not found');
            })
            .pipe(res);
    } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        const response = '<div style="width: 100%; height: 100vh; text-align: center; margin-top: 50px; font-size: 56px;">Access denied</div>';
        res.end(response); 
    }
});

server.listen(3003);