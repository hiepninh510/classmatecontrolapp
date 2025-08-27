import express from 'express';
import route from '../backend/routers/index.js';
import path from 'path';
import cors from 'cors';   
import { Server } from 'socket.io';
import { v4 as uuidv4 } from "uuid";
import http from "http";
import https from "https";
import fs from "fs";
var app = express();
var port = 3000
import { fileURLToPath } from "url";
import { dirname } from "path";
import {db,FieldValue} from './src/config/firebase.js';
const PORT = 3000;
const options = {
  key: fs.readFileSync("./cert/key.pem"),
  cert: fs.readFileSync("./cert/cert.pem"),
};

const server = https.createServer(options, app);
const io = new Server(server, {
  cors: {
    origin: "https://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
  });

  socket.on("disconnect", () => console.log("User disconnected"));

  socket.on("sendMessage", async ({ roomId, senderId, text }) => {
    try {
      const messageId = uuidv4();
      const msg = {
        id: messageId,
        senderId,
        text,
        createdAt: new Date(),
      };

      await db.collection("chats").doc(roomId).update({
        messages: FieldValue.arrayUnion(msg),
      });

      io.to(roomId).emit("newMessage", {
        id: messageId,
        senderId,
        text,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
    }
  });
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use("/src", express.static(path.join(__dirname, "src")));

route(app);

server.listen(PORT, () => {
  console.log(`HTTPS server running on https://localhost:${PORT}`);
});
