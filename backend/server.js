import https from 'https';
import fs from 'fs';
import app from './app.js';
import { initSocket } from './socket/index.js';

const PORT = 3000;

const options = {
  key: fs.readFileSync("./cert/key.pem"),
  cert: fs.readFileSync("./cert/cert.pem"),
};

const server = https.createServer(options, app);

// Khởi tạo socket
initSocket(server);

server.listen(PORT, () => {
  console.log(`HTTPS server running on https://localhost:${PORT}`);
});
