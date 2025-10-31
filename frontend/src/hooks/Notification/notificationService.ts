import { studentAPI } from "../../components/Instructor/ListStudent/InstructorAPI";
import type { Notifi } from "../../models/locationInterface";

export const notificationService = {
    creatNotification:async (data:Notifi) =>{
        switch (data.type) {
            case "assignment":
                 { const notification={
                    userId:data.userId,
                    message:'Bạn vừa được giao 1 bài tập mới!',
                    isRead:false,
                    creatAt:new Date(),
                    upDate:new Date(),
                    type:"assignment",
                    isDelete:false,
                    }
                    const notifiData = {
                        role:data.role,
                        phone:localStorage.getItem('phoneNumber'),
                        notification
                    }
                    const createNotification = await studentAPI.notification(notifiData);
                    return createNotification.data;
                }
            
            case "message":{
                const notification = {
                    userId:data.userId,
                    message:"Vừa gửi một tin nhắn mới",
                    isRead:false,
                    creatAt:new Date(),
                    upDate:new Date(),
                    type:"message",
                    isDelete:false

                }
                const notifiData = {
                        role:data.role,
                        phone:localStorage.getItem('phoneNumber'),
                        notification
                    }
                const createNotification = await studentAPI.notification(notifiData);
                return createNotification.data;
                }

            default:
                break;
        }
    }
}
