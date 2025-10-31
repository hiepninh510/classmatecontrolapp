/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import socket from "../../components/ChatSocket/socket"
import { useAuth } from "../ThemeContext"
import axios from "../../api/api"

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
    const socketRef = useRef<any>(null);
    useEffect(()=>{
        socketRef.current = socket;
        socketRef.current.connect();
        socketRef.current.emit("joinNoticationRoom",id);
        socketRef.current.on("newNotification",(data:Notifications)=>{
            setNotification(prev=>[...prev,data])
        })
        return ()=>{
            socketRef.current.off("newNotification");
        }
    },[id]);

    const fetchNotifications = useCallback(async ()=>{
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
        },[id, role]);
    

    useEffect(()=>{
        fetchNotifications()
        // console.log("notifications",notifications)
    },[fetchNotifications])

    const handleDeleteOneNotifiction = useCallback(async (id:string)=>{
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
    },[]);

    const handleRead = useCallback(async (id:string) =>{
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
    },[]);


    const markAllNotification =useCallback(async () =>{
        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/notification/readAllNotifications`,{id});
            if(res.data.success) {
                setNotification((prev) => prev.map((n) =>( {...n,isRead:true})))
            }
        } catch (error) {
            console.log(error);
        }

    },[id]);
     

    const clearNotifications = () => setNotification([]);
    const unreadCount = useMemo(()=>notifications.filter(item => !item.isRead).length,[notifications]);

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
