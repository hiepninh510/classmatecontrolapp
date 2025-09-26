import {db} from '../config/firebase.js';
import { normalPhoneNumber } from './formatController.js';
import admin from "firebase-admin"; 
import { v4 as uuidv4 } from "uuid"

export async function createInstructor(req,res) {
    try {
        const {name,phoneNumber,email} = req.body
        if(!name || !email){
            return res.status(400).json({success:false,message:'Missing fields'})
        }
        const isUserExisting = await db.collection('users').where('phoneNumber','==',phoneNumber).get();

        if(!isUserExisting.empty){
            return res.status(400).json({success:false,message:'Instructor already exists'});
        }
        await db.collection('users').add({
            name,
            phoneNumber,
            email,
            role:'instructor',
            createAt:new Date()
        });
        return res.status(201).json({seccess:true,message:'Instructor added successfully'});
    } catch (error) {
        return res.status(500).json({success:false,error:error.message});
    }
}

export async function findIdInstructor(req,res) {
    try {
        let phoneNumber = req.query.phoneNumber;
        phoneNumber = normalPhoneNumber(phoneNumber);
        const instructorQurey = await db.collection('users').where('phoneNumber','==',phoneNumber).get();
        if(instructorQurey.empty) res.status(400).json({success:false,message:"Instructor not found"});
        const idInstructor = instructorQurey.docs[0].id;
        return res.status(200).json({success:true,senderId:idInstructor});
    } catch (error) {
        res.status(500).json({success:false,message:error});
    }
}

export async function getSubjects(req,res) {
    try {
        const {id} = req.params;
        if(!id) return res.status(400).json({success:false,message:"Instructor's ID not exits!!!"});
        const userSnap = await db.collection('users').doc(id).get();
        if(!userSnap.exists) res.status(404).json({success:false,message:"Instructor not found"});
        const subjectIs = userSnap.data().subjectId || [];
        const subjects = await Promise.all(
            subjectIs.map(async (item)=>{
                const itemSap = await db.collection("subjects").doc(item).get();
                if(itemSap.exists) return {id:itemSap.id,...itemSap.data()};
                else return null;
            })
        )

        const dataSubjects = subjects.filter(Boolean);
        return res.status(200).json({success:true,dataSubjects});
    } catch (error) {
        res.status(500).json({success:false,message:error});
    }
}

export async function getAllClass(req,res) {
    try {
        const {id} = req.params;
        if(!id) return res.status(400).json({success:false,message:"Instructor's ID not exits!!!"});
        const userSnap = await db.collection('users').doc(id).get();
        if(!userSnap.exists) res.status(404).json({success:false,message:"Instructor not found"});
        const classIds = userSnap.data().classId || [];
        const classs = await Promise.all(
            classIds.map(async (item)=>{
                const itemSnap = await db.collection("class").doc(item).get();
                if(itemSnap.exists) return {id:itemSnap.id,...itemSnap.data()};
                else return null
            })
        )
        const dataClass = classs.filter(Boolean);
        return res.status(200).json({success:true,dataClass});
    } catch (error) {
        res.status(500).json({success:false,message:error});
    }
}

export async function assignLessionForClass(req,res) {
   try {
    const {instructorId,subjectId,classId,description} = req.body;
    if(!instructorId || !subjectId || !classId) 
        return res.status(400).json({success:false,message:"Instructor's ID or Subject's ID or Class's ID not exits!!!"});
    const studentSnap = await db.collection("students").where("classId",'==',classId).get();
    if(studentSnap.empty) {
        return res.status(404).json({success:false,message:"Student not found"});}
    const batch = db.batch();
    studentSnap.forEach((item)=>{
        console.log(item.id)
        const lessonId = `lesson_${Date.now()}_${uuidv4()}`;
        const newLession = {
            id:lessonId,
            createAt: new Date(),
            done:false,
            description,
            instructorId,
            subjectId
        }
        const studentRef = db.collection("students").doc(item.id);
        batch.update(studentRef,{
            lessions:admin.firestore.FieldValue.arrayUnion(newLession),
        });
    });
    await batch.commit();
     return res.status(200).json({
      success: true,
      message: "Assign lessons successfully",
    });
   } catch (error) {
    res.status(500).json({success:false,message:error.message});
   } 
}
