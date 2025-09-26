import axios from "axios";
import { useEffect, useState } from "react";
import socket from "./socket";
import { useAuth } from "../../hooks/ThemeContext";
import { notificationService } from "../../hooks/Notification/notificationService";
import type { Notifi } from "../../models/locationInterface";

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}

interface ChatBoxProps {
  roomId: string;
  idUser:string
}
export default function ChatBox({ roomId,idUser }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [senderId, setSenderId] = useState("");
  const [userId,setUserId] = useState<string|null>(null);
  const {role} = useAuth();
  useEffect(() => {
    socket.connect();
    socket.emit("joinRoom", roomId);

    const fetchMessages = async () => {
      try {
        const phoneNumber = localStorage.getItem('phoneNumber');
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/chats/messages/${roomId}/${phoneNumber}`);
        if (res.data.success) {
          setMessages(res.data.messages);
          setSenderId(res.data.senderId);
          //console.log(messages);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();

    // Nhận tin nhắn realtime
    socket.on("newMessage", (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off("newMessage");
      socket.disconnect();
    };
   
  }, [roomId]);

  useEffect(()=>{
    const fetchIdUser = async ()=>{
      const phone = localStorage.getItem('phoneNumber');
      if(idUser){
        setUserId(idUser);
      }else {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/notification/getIdUserToNotification`,{params:{
          role,
          roomId,
          phone
        }});

        if(res.data.success) setUserId(res.data.userId);
      }
    }
    fetchIdUser()
  })

  const handleSend = async () => {
    if (!newMessage.trim()||!senderId) return;
    
    const data:Notifi = {
      type:"message",
      role,
      userId
    }

    const creatNotifi = await notificationService.creatNotification(data);
    if(creatNotifi?.success) {
          socket.emit("sendMessage", { roomId, senderId, text: newMessage });
          setNewMessage("")
    }
    
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`p-2 rounded-lg max-w-xs ${
              msg.senderId === `${senderId}`
              ? "ml-auto bg-blue-500 text-white"
                : "mr-auto bg-gray-200"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="p-3 border-t flex">
        <input
          className="flex-1 border rounded px-3 py-2"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Nhập tin nhắn..."
        />
        <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSend}>
          Gửi
        </button>
      </div>
    </div>
  );
}