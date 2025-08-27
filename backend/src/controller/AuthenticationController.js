import {db} from '../config/firebase.js';
import twilio from 'twilio';
import 'dotenv/config';
import { FieldValue } from "firebase-admin/firestore";
import { formatPhoneNumber } from './formatController.js';

const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
// const client_Twilio = twilio("AC60e69e93dc5279eb872349799d794334","d506d98252b98049e426ed3a8be9bf1d");
const client_Twilio = twilio(TWILIO_SID,TWILIO_AUTH_TOKEN);


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
        const {phoneNumber,accessCode} = req.body;
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
            const userDoc = await db.collection("users").where('phoneNumber','==',phoneNumber).get();
            const typeUser = !userDoc.empty ? userDoc.docs[0].data()?.role :"student";
            //console.log(formatPhoneNumber(userDoc.docs[0].data().phoneNumber));
            return res.json({success:true,typeUser,phoneNumber:formatPhoneNumber(userDoc.docs[0].data().phoneNumber)});
        }
        return res.status(400).json({success:false,message:"Invalid code"});
    } catch (error) {
        return res.status(500).json({success:false,error:error.message});
    }
}

