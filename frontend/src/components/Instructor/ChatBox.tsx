// ChatBox.tsx
// import { useEffect, useState } from "react";
// import { io } from "socket.io-client";

// const socket = io("http://localhost:3000");

// export default function ChatBox({ roomId }: { roomId: string }) {
//   const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
//   const [newMessage, setNewMessage] = useState("");

//   useEffect(() => {
//     socket.emit("joinRoom", roomId);

//     socket.on("receiveMessage", (data) => {
//       setMessages((prev) => [...prev, { sender: data.senderId, text: data.message }]);
//     });

//     return () => {
//       socket.off("receiveMessage");
//     };
//   }, [roomId]);

//   const sendMessage = () => {
//     if (!newMessage.trim()) return;
//     const msg = { senderId: "me", receiverId: roomId, message: newMessage };
//     socket.emit("sendMessage", msg);
//     setMessages((prev) => [...prev, { sender: "me", text: newMessage }]);
//     setNewMessage("");
//   };

//   return (
//     <div className="flex flex-col h-full">
//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-2">
//         {messages.map((m, i) => (
//           <div key={i} className={m.sender === "me" ? "text-right" : "text-left"}>
//             <span
//               className={`inline-block px-3 py-2 rounded-2xl ${
//                 m.sender === "me" ? "bg-blue-500 text-white" : "bg-gray-300"
//               }`}
//             >
//               {m.text}
//             </span>
//           </div>
//         ))}
//       </div>

//       {/* Input */}
//       <div className="p-3 border-t flex">
//         <input
//           type="text"
//           className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
//           placeholder="Nhập tin nhắn..."
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//         />
//         <button
//           onClick={sendMessage}
//           className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-full"
//         >
//           Gửi
//         </button>
//       </div>
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import axios from "axios";

// interface Message {
//   id: string;
//   senderId: string;
//   text: string;
//   createdAt: string;
// }

// interface ChatBoxProps {
//   roomId: string;
// }

// export default function ChatBox({ roomId }: ChatBoxProps) {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Lấy tin nhắn khi load room
//   useEffect(() => {
//     const fetchMessages = async () => {
//       try {
//         setLoading(true);
//         const res = await axios.get(
//           `${import.meta.env.VITE_BACKEND_URL}/chat/${roomId}/messages`
//         );
//         if (res.data.success) {
//           setMessages(res.data.messages);
//         }
//       } catch (error) {
//         console.error("Lỗi khi load messages:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMessages();
//   }, [roomId]);

//   // Gửi tin nhắn
//   const handleSend = async () => {
//     if (!newMessage.trim()) return;

//     const senderId = localStorage.getItem("userId"); // hoặc phoneNumber, tùy backend
//     if (!senderId) return;

//     try {
//       const res = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/chat/${roomId}/send`,
//         {
//           senderId,
//           text: newMessage,
//         }
//       );

//       if (res.data.success) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             id: res.data.messageId,
//             senderId,
//             text: newMessage,
//             createdAt: new Date().toISOString(),
//           },
//         ]);
//         setNewMessage("");
//       }
//     } catch (error) {
//       console.error("Lỗi khi gửi tin nhắn:", error);
//     }
//   };

//   return (
//     <div className="flex flex-col h-full">
//       {/* Danh sách tin nhắn */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-2">
//         {loading ? (
//           <div className="text-gray-400">Đang tải...</div>
//         ) : messages.length > 0 ? (
//           messages.map((msg) => (
//             <div
//               key={msg.id}
//               className={`p-2 rounded-lg max-w-xs ${
//                 msg.senderId === localStorage.getItem("userId")
//                   ? "ml-auto bg-blue-500 text-white"
//                   : "mr-auto bg-gray-200"
//               }`}
//             >
//               {msg.text}
//             </div>
//           ))
//         ) : (
//           <div className="text-gray-400 text-center">
//             💬 Chưa có tin nhắn nào
//           </div>
//         )}
//       </div>

//       {/* Input nhập tin nhắn */}
//       <div className="p-3 border-t bg-white flex">
//         <input
//           type="text"
//           className="flex-1 border rounded-lg px-3 py-2 focus:outline-none"
//           placeholder="Nhập tin nhắn..."
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleSend()}
//         />
//         <button
//           onClick={handleSend}
//           className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//         >
//           Gửi
//         </button>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import axios from "axios";
import socket from "../ChatSocket/socket.tsx";

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}

interface ChatBoxProps {
  roomId: string;
}

export default function ChatBox({ roomId }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [senderId, setSenderId] = useState("");

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

  const handleSend = async () => {
    if (!newMessage.trim()||!senderId) return;

    socket.emit("sendMessage", { roomId, senderId, text: newMessage });

    setNewMessage("");
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


