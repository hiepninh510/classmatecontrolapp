import { Server } from "socket.io";
import { db, FieldValue } from '../src/config/firebase.js';
import { v4 as uuidv4 } from "uuid";
import * as formatController from '../src/controller/formatController.js'
import {notificationHello} from '../src/controller/NotificationController.js'

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "https://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Authorization"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`${socket.id} joined room ${roomId}`);
    });

    socket.on("joinNotificationRoom", (userId) => {
      socket.join(userId);
      console.log(`${socket.id} joined notification room: ${userId}`);
    });

    socket.on("sendMessage", async ({ roomId, senderId, text }) => {
      try {
        const messageId = uuidv4();
        const msg = { id: messageId, senderId, text, createdAt: new Date() };
        await db.collection("chats").doc(roomId).update({
          messages: FieldValue.arrayUnion(msg),
        });
        io.to(roomId).emit("newMessage", { ...msg, createdAt: new Date().toISOString() });
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("joinRoomAdmin",async(phoneNumber,typeUser)=>{
      if(typeUser === "admin") socket.join("adminRoom");
      else {
        const formatPhoneNumber = formatController.normalPhoneNumber(phoneNumber);
        const notifi = notificationHello(typeUser,formatPhoneNumber);
        if(notifi) socket.join("adminRoom");
        else socket.join("adminRoom");
      }
      console.log("Đã join vào room có Admin")
    })

    socket.on("disconnect", () => console.log(`User disconnected: ${socket.id}`));
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized!");
  return io;
};
