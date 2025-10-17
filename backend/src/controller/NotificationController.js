import { db } from '../config/firebase.js';
import {normalPhoneNumber, formatPhoneNumber } from './formatController.js';
// import {io} from "../../app.js"
import { getIO } from '../../socket/index.js';

function createNotificationForAdmin({ type, userId, senderId, senderName, message }) {
  const now = new Date().toISOString();

  return {
    type,           // "message" | "register" | "alert" ...
    userId,         // id người nhận
    senderId,       // id người gửi
    senderName,     // tên người gửi
    message,        // nội dung thông báo
    isRead: false,  // mặc định chưa đọc
    isDelete:false,
    createdAt: now, // thời gian tạo
    upDate: now,    // cập nhật lần đầu = thời gian tạo
  };
}

export async function creatNotification(req,res){
    try {
        const {role,phone,notification} = req.body;
        // console.log("roler",role);
        // console.log("phone",phone);
        // console.log("notification",notification);
        const phoneNumber =normalPhoneNumber(phone);
        if(!notification || Object.keys(notification).length === 0 || !phoneNumber) return res.status(400).json({success:false,message:"Creat notification not success!"});
        let senderDoc;
        if(role === "student"){
            senderDoc = await db.collection('students').where("phoneNumber","==",phoneNumber).get();
            if(senderDoc.empty) return res.status(400).json({success:false,message:"Sender not found !!!"});
        } else {
            senderDoc = await db.collection("users").where("phoneNumber","==",phoneNumber).get();
            if(senderDoc.empty) return res.status(400).json({success:false,message:"Sender not found !!!"});
        }
        const senderId = senderDoc.docs[0].id;
        const senderName = senderDoc.docs[0].data().name;
        const newNotification = {
            ...notification,
            senderId,
            senderName,
        }
        const notificationDocRef = await db.collection("notifications").add(newNotification);
        const io = getIO();
        io.to(notification.userId).emit("newNotification",{
            id:notificationDocRef.id,
            ...newNotification
        });
        return res.status(200).json({success:true,message:"Create notification is success"});
    } catch (error) {
        return res.status(500).json({success:false,error:error.message});
    }
}

export async function notificationHello(role,phone) {
    try {
        if(!role && !phone) return null;
        const userSnap = await db.collection('users')
        .where("phoneNumber",'==',phone)
        .where("role",'==',role)
        .get();

        if(userSnap.empty) return null;
        const notificationOfUser = await db.collection("notifications")
        .where("userId","==",userSnap.docs[0].id)
        .get();

        if(!notificationOfUser.empty) return false ;
        const admin = await db.collection("users").where("role","==","admin").get();
        const notification = createNotificationForAdmin({
            type:"system",
            userId:userSnap.docs[0].id,
            senderId:admin.docs[0].id,
            senderName:admin.docs[0].data().name,
            message:"Xin chào!"
        })
        await db.collection("notifications").add(notification);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function createNotificationFromAdmin(req,res) {
    try {
        const { type,email, message } = req.body;
        if (!email) {
            throw new Error("Invalid notification data");
        }
        const receiverDoc = await db.collection("users").where("email","==",email).get();
        const admin = await db.collection("users").where("role","==","admin").get();
        if(admin.empty && receiverDoc.empty) throw new Error("Sender not found");
    
        const senderId = admin.docs[0].id;
        const senderName = admin.docs[0].data().name;
    
        const notification = createNotificationForAdmin({
            type,
            userId:receiverDoc.docs[0].id,
            senderId,
            senderName,
            message
        })
        const notificationDocRef = await db.collection("notifications").add(notification);
        // Gửi socket event
        const io = getIO();
        io.to(notification.userId).emit("newNotification", {
            id: notificationDocRef.id,
            ...notification,
        });
        return res.status(200).json({success:true,message:"Create notification is success"});
    } catch (error) {
        return res.status(500).json({success:false,error:error.message});
    }
}


export async function getNotifications(req,res) {
    try {
        const {role,userId} = req.query;
        if(!role && !userId) return res.status(400).json({success:false,message:"Role or UserId not exist!!!!"});
        let dataNotiSnap = null;
        switch (role) {
            case "student":
                dataNotiSnap = await db.collection("notifications").where("userId",'==',userId).where("isDelete",'==',false).get();
                break;
            case "instructor":
                dataNotiSnap = await db.collection("notifications").where("userId",'==',userId).where("isDelete",'==',false).get();
                break;
            
            case "admin":
                dataNotiSnap = await db.collection("notifications").where("userId",'==',userId).where("isDelete",'==',false).get();
                break;
            default:
                break;
        }

        const notifications = dataNotiSnap.docs.map(doc =>({
            id:doc.id,
            ...doc.data()
        }));

        return res.status(200).json({success:true,notifications});
        
    } catch (error) {
        return res.status(500).json({success:false,error:error.message});
    }
}

export async function getIdUserToNotification(req,res){
    try {
        const {role,roomId,phone} = req.query;
        // console.log("roler",role);
        // console.log("roomId",roomId);
        // console.log("phone",phone);
        const phoneNumber = normalPhoneNumber(phone);
        if(!role || !roomId || !phone) return res.status(400).json({success:false,message:"Role or RoomId or Phone not exists!!!"});
        const roomSnap = await db.collection("chats").doc(roomId).get();
        if(!roomSnap.exists) return res.status(400).json({success:false,message:"Chat Room not found!!!"});
        const participants = roomSnap.data().participants;
        let clientSnap = null;
        let clientId = null;
        switch (role) {
            case "student":
                clientSnap = await db.collection("students").where("phoneNumber","==",phoneNumber).get();
                clientId = clientSnap.docs[0].id;
                break;
            case "instructor":
                clientSnap = await db.collection("users").where("phoneNumber","==",phoneNumber).get();
                clientId = clientSnap.docs[0].id;
            default:
                break;
        }
        // console.log("clientId",clientId);
        let userId = null;
        if(clientId && participants.includes(clientId)){
            userId = participants.find(item => item !== clientId);
        }
        // console.log("userId",userId);
        return res.status(200).json({success:true,userId});

    } catch (error) {
        return res.status(500).json({success:false,error:error.message});
    }
}

export async function updateIsRead(req,res) {
    try {
        const {id} = req.body;
        if(!id) return res.status(400).json({success:false,message:"Id undefined!!!"});
        const notiRef = db.collection("notifications").doc(id);
        const notiSnap = await notiRef.get();
        if(!notiSnap.exists) return res.status(404).json({success:false,message:"Notification is not exist!!!"});

        await notiRef.update({isRead:true});
        return res.status(200).json({success:true,message:"Update success!"});

    } catch (error) {
         return res.status(500).json({success:false,error:error.message});
    }
}

export async function deleteOneNotification(req,res) {
    try {
        const {id} = req.query;
        if(!id) return res.status(400).json({success:false,message:"Id not exists!!!"});
        const notiRef = db.collection("notifications").doc(id);
        const notiSnap = await notiRef.get();
        if(!notiSnap.exists) return res.status(404).json({success:false,message:"Notification is not exist!!!"});

        await notiRef.update({isDelete:true});
        return res.status(200).json({success:true,message:"Delete notification success!"});
    } catch (error) {
        return res.status(500).json({success:false,error:error.message});
    }
}

export async function deleteAllNotification(req,res) {
    try {
        const {userId} = req.query;
        if(!userId) return res.status(400).json({success:false,message:"UserId not exists!!!"});
        const notiSnap = await db.collection("notifications").where("userId",'==',userId).get();
        const batch = db.batch();
        notiSnap.forEach((doc) =>{
            batch.update(doc.ref,{isDelete:true});
        })
        await batch.commit();
        return res.status(200).json({success:true,message:"Delete all notification success!"});
    } catch (error) {
        return res.status(500).json({success:false,error:error.message});
    }
    
}

export async function readAllNotifications(req,res) {
    try {
        const {id} = req.body;
        if(!id) return res.status(400).json({success:false,message:"UserId not exists!!!!"});
        const notiSnap = await db.collection("notifications").where("userId",'==',id).get();
        if(notiSnap.empty) return res.status(404).jason({success:false, message:"Notification not found!!!"});
        const batch = db.batch();
        notiSnap.forEach((doc)=>{
            batch.update(doc.ref,{isRead:true});
        })
        return res.status(200).json({success:true,message:"Update all notification is read"});
        
    } catch (error) {
        return res.status(500).json({success:false,error:error.message});
    }
}