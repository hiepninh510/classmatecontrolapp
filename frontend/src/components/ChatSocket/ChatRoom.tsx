import { useEffect, useState } from "react"
import { useAuth } from "../../hooks/ThemeContext";
import axios from "../../api/api";
import socket from "./socket";
import ChatBox from "./ChatBox";

interface IdUserProp{
    idUser:string|null|undefined
}

interface ChatRoom{
    id:string,
    name:string,
    participants: string[];
}

export function ChatRooms({idUser}:IdUserProp){
    const [rooms,setChatRoom] = useState<ChatRoom[]>([]);
    const [activeRoom,setActiveRoom] = useState<string|null>(null);
    const [userId,setUserId] = useState<string|null>(null);

    const {role} = useAuth();

    useEffect(()=>{
        const fetchRoom = async ()=>{
            try {
                const value = {
                    phoneNumber: localStorage.getItem("phoneNumber")
                }
                if(!value) return;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let res:any ;
                if(role === "student") {
                      res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/chats/messagesStudent`,value);
                } else if(role === "instructor") {
                      res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/chats/messages`,value);
                } else if(role === "admin"){
                  res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/messages`)
                }
                if(res.data.success) setChatRoom(res.data.chatRooms ?? []);
                if(idUser){
                    const targetRoom = (res.data.chatRooms ?? []).find((room:ChatRoom)=>
                        room.participants.includes(idUser)
                    )
                    setUserId(idUser);
                    if(targetRoom) {
                        setActiveRoom(targetRoom.id);
                    }
                }
            } catch (error) {
               console.log(error); 
            }
        }
        fetchRoom();
    },[role,idUser])

    useEffect(()=>{
        if(!activeRoom) return;
        socket.connect();
        socket.emit('joinRoom',activeRoom);

        return ()=>{
            socket.emit("leaveRoom",activeRoom);
        }
    },[activeRoom]);


    const activeRoomData = rooms.find((r)=>r.id === activeRoom);

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
                <ChatBox roomId={activeRoom} idReceiver={userId as string}  />
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