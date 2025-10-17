import {db} from '../config/firebase.js';
import { normalPhoneNumber } from './formatController.js';
import admin from "firebase-admin"; 
import { v4 as uuidv4 } from "uuid"

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
    return res.status(500).json({success:false,message:error.message});
   } 
}

export async function getAssignedSubject(req,res) {
    try {
        const {id} = req.params;

        if(!id) return res.status(404).json({success:false,message:"Instructor's ID or Student'S ID not exits!!!"});
        const instructorSnap = await db.collection("users").doc(id).get();
        if(!instructorSnap.exists) return res.status(404).json({success:false,message:"Instructor not found"});

        const assignmentSnap = await db.collection('assignments')
        .where('classId','in',instructorSnap.data().classId)
        .where('instructorId','==',instructorSnap.id)
        .get()

        if(assignmentSnap.empty) return res.status(404).json({success:false,message:"Assignment not found"});

        const assignmentData = assignmentSnap.docs.map(doc => ({id:doc.id,...doc.data()}));
        let subjectSnap = await Promise.all(
                assignmentData.map(async(item)=>{
                    const itemSnap = await db.collection("subjects").doc(item.subjectId).get();
                    if(itemSnap.exists) return {id:itemSnap.id,...itemSnap.data()};
                    else return null;
                })
            );

            const dataSubjects = subjectSnap.filter(Boolean);
            return res.status(200).json({success:true,dataSubjects})

        
    } catch (error) {
        return res.status(500).json({success:false,message:error.message});
    }
}

export async function getListStudentToEnterScore(req,res) {
    try {
        const {classId,subjectId,id} = req.query;
        if(!classId || !subjectId) return res.status(404).json({success:false,message:"Instructor's ID or Subject'S ID not exits!!!"});

        const assignmentSnap = await db.collection("assignments")
        .where('classId','==',classId)
        .where('subjectId','==',subjectId)
        .where("instructorId","==",id)
        .get()

        if(assignmentSnap.empty) return res.status(404).json({success:false,message:"You haven't been assigned to this class!!!"});

        const classRef = await db.collection('class').doc(classId).get();
        if(!classRef.exists) return res.status(404).json({success:false,message:"Class not exist!!!"});

        const studentSnap = await db.collection("students").where('classId','==',classId).get();
        if(studentSnap.empty) return res.status(404).json({success:false,message:"List student not found!!!"});

        const studentData = studentSnap.docs.map((doc)=>({id:doc.id,...doc.data()}))
        let score = await Promise.all(
            studentData.map(async (item)=>{
                const scoreSnap = await db.collection('scores').where("studentId",'==',item.id).get()
                if(!scoreSnap.empty) return {... scoreSnap.docs[0].data()};
                else return null;
            })
        )
        const scoresData = score.filter(Boolean);

        const scoreMap = new Map(scoresData.map((s)=>[s.studentId,s.score]));

        const subjectRef = await db.collection("subjects").doc(subjectId).get();
        if(!subjectRef.exists) return res.status(404).json({success:false,message:"Subject not exist!!!"});

        const students = studentSnap.docs
        .map((doc)=> {
            console.log(scoreMap.get(doc.id));
            return {
            id:doc.id,
            name:doc.data().name,
            className:classRef.data().name,
            subjectName:subjectRef.data().name,
            score:scoreMap.get(doc.id) || null
        }});

        return res.status(200).json({success:true,students});

        
    } catch (error) {
        return res.status(500).json({success:false,message:error.message});
    }
}


export async function saveScore(req,res){
    try {
        const data = req.body;
        if(!data) return res.status(400).json({success:false,message:"ID not exist!!!"});
        const batch = db.batch();

        for(const item of data){
            const scoreSnap = await db.collection("scores").where("studentId","==",item.id).get();
            if(scoreSnap.empty) return

            const docRef = scoreSnap.docs[0].ref;
            const existingScore = scoreSnap.docs[0].data().score || [];

            const index = existingScore.findIndex((s)=>s.phase === item.score[0].phase &&  s.subjectId === item.score[0].subjectId);
            if(!isNaN(item.score[0].total)&& Number(item.score[0].total)>=4) item.score[0].pass = true;
            
            existingScore[index] = { ...existingScore[index], ...item.score[0] };

            batch.update(docRef, { score: existingScore });
        }

        await batch.commit();
        return res.status(200).json({ success: true, message: "Scores updated successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function getMySchedules(req,res) {
    try {
        const {id} = req.params;
        if(!id) return
        const scheduleSnap = await db.collection("schedules").where("instructorId",'==',id).get();
        if(scheduleSnap.empty) return
        const scheduleData = await Promise.all(
            scheduleSnap.docs[0].data().schedule.map(async(sch)=>{
                const classSnap = await db.collection("class").doc(sch.classId).get();
                const roomSnap = await db.collection("rooms").doc(sch.roomId).get();
                const subjectSnap = await db.collection("subjects").doc(sch.subjectId).get();
                const timeSnap = await db.collection("times").doc(sch.timeId).get();

                if(!classSnap.exists && !roomSnap.exists && !subjectSnap.exists && !timeSnap.exists) return

                return {
                    ...sch,
                    className:classSnap.data().name,
                    roomName:roomSnap.data().name,
                    subjectName:subjectSnap.data().name,
                    timeFrame:timeSnap.data().timeFrame
                }
            })
        )
        // console.log("scheduleData",scheduleData);
        return res.status(200).json({success:true,scheduleData})
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,error});
    }
}


