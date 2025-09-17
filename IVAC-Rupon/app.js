import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


let keyData = null;
let requestedData = [];
const keyFile = fs.readFileSync(path.join(__dirname, 'key.json'), 'utf8');
if(keyFile){
    keyData = JSON.parse(keyFile);
    console.log('\n\nKey data loaded successfully');
    console.log(keyData); // Example log to verify content
}else{
    console.log('Key file not found');
}
const alreadyRequested = fs.readFileSync(path.join(__dirname, 'requestedDeviceId.json'), 'utf8');
if(alreadyRequested){
    requestedData = JSON.parse(alreadyRequested);
    console.log('\n\nRequested data loaded successfully');
    console.log(requestedData); // Example log to verify content
}
const isInRequestedData = (deviceId, key) => {
    return requestedData.some(item => item.deviceId === deviceId && item.key === key);
}


// Create server
const server = http.createServer((req, res) => {
    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const key = url.searchParams.get('key');

        const deviceId = req.headers['x-device-id'];
        if (!deviceId) {
            res.writeHead(400, {'Content-Type': 'text/html'});
            return res.end('Missing device ID');
        }

        if (deviceId && key && keyData[key] && keyData[key].includes(deviceId)) {
            const filePath = path.join(__dirname, 'IVAC.js');
            res.writeHead(200, {'Content-Type': 'text/html', 'Content-Length': fs.statSync(filePath).size, 'cross-origin': 'anonymous', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'});

            fs.createReadStream(filePath)
                .on('error', () => {
                    res.writeHead(404, {'Content-Type': 'text/plain'});
                    res.end('File not found');
                })
                .pipe(res);

        }else if(keyData[key] && !keyData[key].includes(deviceId) && isInRequestedData(deviceId, key)){
            res.writeHead(401, {'Content-Type': 'text/html'});
            const response = '<div>You have already requested for this key</div>';
            return res.end(response);
        }else if(keyData[key] && !keyData[key].includes(deviceId) && !isInRequestedData(deviceId, key)){
            const newEntry = {key,deviceId, timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString() };
            requestedData.push(newEntry);
            fs.writeFileSync(path.join(__dirname, 'requestedDeviceId.json'), JSON.stringify(requestedData, null, 2),
                (err) => {if (err) {console.log('Error writing device id to file:', err);}});
            res.writeHead(200, {'Content-Type': 'text/html'});
            const response = '<div>You have requested for access</div>';
            return res.end(response);
        }else {
            res.writeHead(401, {'Content-Type': 'text/html'});
            const response = '<div style="width: 100%; height: 100vh; text-align: center; margin-top: 50px; font-size: 56px;">Access denied</div>';
            return res.end(response);
        }


    }catch (e) {
        console.log('Error in server request', e);
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});