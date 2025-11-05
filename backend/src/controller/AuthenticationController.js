import {db} from '../config/firebase.js';
import twilio from 'twilio';
import 'dotenv/config';
import { FieldValue } from "firebase-admin/firestore";
import { formatPhoneNumber } from './formatController.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
// const client_Twilio = twilio("AC60e69e93dc5279eb872349799d794334","d506d98252b98049e426ed3a8be9bf1d");
const client_Twilio = twilio(TWILIO_SID,TWILIO_AUTH_TOKEN);

export async function creatToken(req,res) {
    const {id,typeUser} = req.body;
    console.log(id)
    if(!id && !typeUser) return res.status(400).json({success:false,message:"Id or TypeUser is not existing "});
    const payload = {userId:id,role:typeUser};
    const token = jwt.sign(payload,process.env.JWT_SECRET,{ expiresIn: "1h" });
    return res.status(200).json({success:true,token});
}


export async function createAccessCode(req,res) {
    try {
        const {phoneNumber} = req.body;
        //console.log(phoneNumber);
        const accessCode = Math.floor(100000+Math.random() * 900000).toString();
        const userQuery = await db.collection('users').where('phoneNumber','==',phoneNumber).where("deleted",'==',false).get();
        if (userQuery.empty) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const email = userQuery.docs[0].data().email;
        const accessCodeQuery = await db.collection("users").where('phoneNumber','==',phoneNumber).get()
        if(accessCodeQuery.empty){
            await db.collection("users").ref.update({
                phoneNumber,
                email,
                accessCode,
                createdAt: new Date(),
            });
        } else {
            await accessCodeQuery.docs[0].ref.update({
                accessCode,
                createdAt: new Date(),
            });
        }
        // await client_Twilio.messages.create({
        //     body:`Code for you ${accessCode}`,
        //     from:"+15615134614",
        //     to:phoneNumber,
        // });
        return res.json({success:true, message:"Access code sent!"});
    } catch (error) {
        return res.status(500).json({success:false,error:error.message});
    }
}

export async function validateAccessCode(req,res) {
    try {
        const {accessCode} = req.body;
        const doc = await db.collection("users")
        .where('accessCode','==',accessCode)
        // .orderBy("createdAt","desc")
        // .limit(1)
        .get();
        if(doc.empty){
            return res.json({success:false,message:"No code found"});
        }
        const data = doc.docs[0].data();
        // console.log("data",data);
        if(data?.accessCode === accessCode){
            await doc.docs[0].ref.update({
                accessCode:FieldValue.delete(),
                createdAt:FieldValue.delete(),
                lastLogin:new Date()
            });
            // await doc.docs[0].ref.delete();
            // const userDoc =  //await db.collection("users").where('phoneNumber','==',phoneNumber).get();
            const typeUser = data.role ||'instructor'
            let id= doc.docs[0].id;
            if(typeUser === "instructor"){
                id = doc.docs[0].id
            } else {
                const studentSnap = await db.collection("students").where("phoneNumber",'==',data.phoneNumber).get();
                id = studentSnap.docs[0].id
            }
            const userName = data.name;
            //console.log(formatPhoneNumber(userDoc.docs[0].data().phoneNumber));
            const payload = {userId:id,role:typeUser};
            const token = jwt.sign(payload,process.env.JWT_SECRET,{ expiresIn: "1h" });
            return res.json({success:true,typeUser,phoneNumber:formatPhoneNumber(data.phoneNumber),userName,id,token});
        }
        return res.status(400).json({success:false,message:"Invalid code"});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}


export async function defaultLogin(req,res) {
    try {
        const {code, password} = req.body;
        if(!code || !password) return res.status(400).json({success:false,message:"Password and Code isn't exist!!!!"});
        const userSnap = await db.collection("users").where("code","==",code).get();
        if(userSnap.empty) return res.status(404).json({success:false,message:"Creat notification not success!"});
        const match = await bcrypt.compare(password,userSnap.docs[0].data().password);
        if(!match) return res.status(400).json({success:false,message:"Password isn't true!!!!"});

        const typeUser = userSnap.docs[0].data().role;
        let id= null;
        if(typeUser ==="instructor"){
            id = userSnap.docs[0].id
        } else if(typeUser === "student"){
            const studentSnap = await db.collection("students").where("phoneNumber",'==',userSnap.docs[0].data().phoneNumber).get();
            if(studentSnap.empty) return res.status(400).json({success:false,message:"Student doesn't exists!!!"});
            id = studentSnap.docs[0].id
        } else{
            id = userSnap.docs[0].id
        }
        const userName = userSnap.docs[0].data().name;
        const payload = {userId:id,role:typeUser};
        const token = jwt.sign(payload,process.env.JWT_SECRET,{ expiresIn: "1h" });
        return res.json({success:true,typeUser,phoneNumber:formatPhoneNumber(userSnap.docs[0].data().phoneNumber),userName,id,token});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function deleteAccode(req,res) {
    try {
        
        const {email} = req.body;
        const userSnap = await db.collection("users").where("email","==",email).get();
        if(userSnap.empty) return res.status(404).json({success:false,message:"Không tìm thấy email"});
        await userSnap.docs[0].ref.update({
            accessCode: FieldValue.delete(),
        })
        return res.status(200).json({
          success: true,
          message: "Đã xóa trường accessCode thành công",
        });     
    } catch (error) {
        console.error("Error removing accessCode:", error);
        return res.status(500).json({ success: false, message: "Lỗi khi xóa accessCode" });
    }
}


export async function forgetPassWord(req,res) {
    try {
    const {email,accessCode}  = req.body;
    const userSnap = await db.collection("users")
    .where("email","==",email)
    .where("accessCode","==",accessCode)
    .get();

    if(userSnap.empty) return res.status(404).json({success:false,message:"Mã xác thực không đúng"});
    
    await userSnap.docs[0].ref.update({
        accessCode:FieldValue.delete()
    })

    return res.status(200).json({success:true,message:"Xác thực thành công"})
        
    } catch (error) {
        console.error("Error validating accessCode:", error);
        return res.status(500).json({ success: false, message: "Lỗi khi xác thực" });
    } 
}

export async function changePassWord(req,res) {
    try {
        const {password,email} = req.body;
        const userSnap = await db.collection("users")
        .where("email","==",email)
        .get();

        if(userSnap.empty) return res.status(404).json({success:false,message:"Không tìm thấy email"});
        const newpassword = await bcrypt.hash(password, 10);
        await userSnap.docs[0].ref.update({
            password:newpassword
        })
        return res.status(200).json({success:true,message:"Đổi mật khẩu thành công"})
        
    } catch (error) {
        console.error("Error validating accessCode:", error);
        return res.status(500).json({ success: false, message: "Lỗi khi xác thực" });  
    }
}

