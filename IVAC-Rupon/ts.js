import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


let keyData;
        const keyFile = fs.readFileSync(path.join(__dirname, 'key.json'), 'utf8');
        if(keyFile){
            const res = JSON.parse(keyFile);
            keyData = res.keyAndDeviceId;
            console.log('Key data loaded successfully');
            console.log(keyData); // Example log to verify content
        }else{
            console.log('Key file not found');
        }

// Create server
const server = http.createServer((req, res) => {

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});