import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import socket from "../../components/ChatSocket/socket"
import { useAuth } from "../ThemeContext"
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
    updateAt:Date,
    isDelete:boolean
}

type NotificationContextType = {
    notifications:Notifications[],
    unreadCount:number,
    handleRead:(id:string)=>Promise<void>,
    handleDeleteOneNotifiction:(id:string)=>Promise<void>,
    markAllNotification:()=>Promise<void>,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    const handleDeleteOneNotifiction = async (id:string)=>{
        try {
            if(id){
                const res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/notification/deleteOneNotification`,{params:{id}});
                if(res.data.success) {
                setNotification(prev => prev.filter(n => n.id !== id));
            }
        }
        } catch (error) {
            console.log(error);
        }
    }

    const handleRead = async (id:string) =>{
        try {
            if(id){
                const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/notification`,{id});
                if(res.data.success) {
                setNotification(prev=> prev.map(n=>n.id === id ? {...n,isRead:true} : n));
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    const markAllNotification = async () =>{
        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/notification/readAllNotifications`,{id});
            if(res.data.success) {
                setNotification((prev) => prev.map((n) =>( {...n,isRead:true})))
            }
        } catch (error) {
            console.log(error);
        }

    }

    const clearNotifications = () => setNotification([]);
    const unreadCount = notifications.filter(item => !item.isRead).length;

    return (
        <>
            <NotificationContext.Provider value={
                {
                    notifications, 
                    unreadCount,
                    handleRead,
                    handleDeleteOneNotifiction,
                    markAllNotification,
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
