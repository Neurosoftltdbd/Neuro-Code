import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyList = ['Rupon','326546', '543214', '987658', '948564'];

const deviceMap = {
    "Rupon":["Rupon-device-0erbqaqza7uq", "Rupon-device-0erbqaqza7uq"]
};

const server = http.createServer(function(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const key = url.searchParams.get('key');

    // Get device ID from headers
    const deviceId = req.headers['x-device-id'];

    if(deviceId && key && !deviceMap[key].includes(deviceId)){
        fs.appendFile(path.join(__dirname, 'requestedDeviceId.json'), JSON.stringify({ key,deviceId, timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString() }), (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            }
        });
    }

    if (!deviceId) {
        res.writeHead(400, {'Content-Type': 'text/html'});
        return res.end('Missing device ID');
    }

    if (keyList.includes(key) && deviceMap[key].includes(deviceId)) {
        const filePath = path.join(__dirname, 'IVAC.js');
        fs.createReadStream(filePath)
            .on('error', () => {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('File not found');
            })
            .pipe(res);
    } else {
        res.writeHead(401, {'Content-Type': 'text/html'});
        const response = '<div style="width: 100%; height: 100vh; text-align: center; margin-top: 50px; font-size: 56px;">Access denied</div>';
        res.end(response);
    }
});

server.listen();