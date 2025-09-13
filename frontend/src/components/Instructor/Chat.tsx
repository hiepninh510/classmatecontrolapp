import { useEffect, useState } from "react";
import axios from "axios";
import socket from '../ChatSocket/socket.tsx'
import ChatBox from "./ChatBox.tsx";

interface ChatRoom {
  id: string;
  name: string;
  participants: string[];
}

export default function ChatApp({ chatTarget }: { chatTarget?: string | null }) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
          const values = {
            phoneNumber: localStorage.getItem("phoneNumber"),
          };
  
          if (!values.phoneNumber) return;
  
          const res = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/chats/messages`,
            values
          );
          // console.log(res.data.chatRooms)
          if (res.data.success) {
            setRooms(res.data.chatRooms ?? []);
        }

        if(chatTarget){
          const targetRoom = (res.data.chatRooms ?? []).find((room:ChatRoom)=>
          room.participants.includes(chatTarget))
          if(chatTarget && targetRoom) setActiveRoom(targetRoom.id);
        }
      } catch (error) {
        console.error("Lỗi khi load danh sách phòng chat:", error);
      }
    };

  
    fetchRooms();
  }, [chatTarget]);

  useEffect(() => {
  if (!activeRoom) return;
  socket.connect();
  socket.emit("joinRoom", activeRoom);

  return () => {
    socket.emit("leaveRoom", activeRoom);
  };
}, [activeRoom]);

  const activeRoomData = rooms.find((r) => r.id === activeRoom);

  return (
    <div className="flex h-screen">
 
      <div className="w-1/4 border-r bg-gray-100 flex flex-col">
        <div className="p-4 font-bold text-lg border-b">Chats</div>
        <div className="flex-1 overflow-y-auto">
          {rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-200 ${
                activeRoom === room.id ? "bg-blue-100 font-semibold" : ""
              }`}
            >

              <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold">
                {room.name.charAt(0).toUpperCase()}
              </div>
              <span>{room.name}</span>
            </div>
          ))}
        </div>
      </div>


      <div className="flex-1 flex flex-col">

        <div className="p-4 border-b bg-white font-bold flex items-center gap-3">
          {activeRoomData ? (
            <>

              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                {activeRoomData.name.charAt(0).toUpperCase()}
              </div>
              <span>{activeRoomData.name}</span>
            </>
          ) : (
            "Chọn 1 cuộc trò chuyện"
          )}
        </div>


        <div className="flex-1 overflow-y-auto bg-gray-50">
          {activeRoom ? (
            <ChatBox roomId={activeRoom} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>👋 Chọn một phòng chat để bắt đầu trò chuyện</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
