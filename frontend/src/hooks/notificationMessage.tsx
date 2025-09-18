import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import socket from "../components/ChatSocket/socket"
import { useAuth } from "./ThemeContext"
import axios from "axios"

type Notifications = {
    id:string,
    userId:string,
    senderId:string,
    senderName:string,
    message:string,
    type:string,
    referenceId:string | null,
    isRead:boolean,
    creatAt: Date,
    updateAt:Date
}

type NotificationContextType = {
    notifications:Notifications[],
    unreadCount:number,
    clearNotifications:()=>void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider ({children}:{children:ReactNode}){
    const [notifications,setNotification] = useState<Notifications[]>([]);
    const {role,id} = useAuth();
    useEffect(()=>{
        socket.connect();
        socket.emit("joinNoticationRoom",id);
        socket.on("newNotification",(data:Notifications)=>{
            setNotification(prev=>[...prev,data])
        })
        return ()=>{
            socket.off("newNotification");
        }
    },[id]);

    const fetchNotifications =async ()=>{
            try {
               const userId = id;
               const values = {
                role,
                userId
               };
               const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/notification`,{
                params:values
               });
               if(res.data.success){
                setNotification(res.data.notifications);
               }
            } catch (error) {
                return error;
            }
        }

    useEffect(()=>{
        fetchNotifications()
    })

    const clearNotifications = () => setNotification([]);

    return (
        <>
            <NotificationContext.Provider value={
                {
                    notifications, 
                    unreadCount: notifications.length, 
                    clearNotifications 
                }
            }
            >
                {children}
            </NotificationContext.Provider>

        </>
    )
}
    // eslint-disable-next-line react-refresh/only-export-components
    export const useNotification = () => {
        const context = useContext(NotificationContext);
        if (!context) throw new Error("useNotification phải dùng trong NotificationProvider");
        return context;
}