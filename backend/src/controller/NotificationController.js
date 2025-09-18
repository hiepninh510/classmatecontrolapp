import { db } from '../config/firebase.js';
import {normalPhoneNumber, formatPhoneNumber } from './formatController.js';
import {io} from "../../app.js"

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
            senderName
        }
        const notificationDocRef = await db.collection("notifications").add(newNotification);

        io.to(notification.userId).emit("newNotification",{
            id:notificationDocRef.id,
            ...newNotification
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
                dataNotiSnap = await db.collection("notifications").where("userId",'==',userId).where("isRead","==",false).get();
                break;
            case "instructor":
                dataNotiSnap = await db.collection("notifications").where("userId",'==',userId).where("isRead","==",false).get();
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