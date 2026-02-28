import {db} from '../config/firebase.js';
// import { normalPhoneNumber } from './formatController.js';
import admin from "firebase-admin"; 
import { v4 as uuidv4 } from "uuid"
import * as instructorServices from "../services/instructorServices.js"
import * as subjectServices from '../services/subjectServices.js'
import * as classServices from '../services/classesServices.js'
import * as studentServices from '../services/studentServices.js'
import * as scoreServices from "../services/scoreServices.js"
import * as scheduleServices from "../services/scheduleServices.js"

export async function findIdInstructor(req,res) {
    try {
        const phoneNumber = req.query.phoneNumber;
        const senderId = await instructorServices.findIdInstructor(phoneNumber);
        if(!senderId) return res.status(400).json({success:false,message:"Thất bại"});
        return res.status(200).json({success:true,senderId});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function getSubjectsOfInstructor(req,res) {
    try {
        const {id} = req.params;
        const dataSubjects = await subjectServices.getSubjectsOfInstructor(id);
        if(!dataSubjects) return res.status(400).json({success:false,message:"Thất bại"})
        return res.status(200).json({success:true,dataSubjects});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function getAllClass(req,res) {
    try {
        const {id} = req.params;
        if(!id) return res.status(400).json({success:false,message:"Instructor's ID not exits!!!"});
       
        const dataClass = await classServices.getAllClassForInstructor(id);
        if(!dataClass) return res.status(400).json({success:false,message:"Lấy danh sách lớp học thất bại"});
        return res.status(200).json({success:true,dataClass});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function assignLessionForClass(req,res) {
   try {
    const {instructorId,subjectId,classId,description} = req.body;
    if(!instructorId || !subjectId || !classId) 
        return res.status(400).json({success:false,message:"Instructor's ID or Subject's ID or Class's ID not exits!!!"});
    const isAssignLesion = await classServices.assignLessionForClass(instructorId,subjectId,classId,description);
    if(!isAssignLesion) return res.status(400).json({success:false,message:"Thất bại"});
     return res.status(200).json({
      success: true,
      message: "Assign lessons successfully",
    });
   } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
   } 
}

export async function getAssignedSubject(req,res) {
    try {
        const {id} = req.params;
        if(!id) return res.status(404).json({success:false,message:"Instructor's ID or Student'S ID not exits!!!"});

        const dataSubjects = await subjectServices.getAssignedSubject(id);
        if(!dataSubjects) return res.status(404).json({success:false,message:"Thất bại"});
        return res.status(200).json({success:true,dataSubjects})
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function getListStudentToEnterScore(req,res) {
    try {
        const {classId,subjectId,id} = req.query;
        const data = await studentServices.getListStudentToEnterScore(classId,subjectId,id);
        if(!data.success) return res.status(400).json({success:false,message:data.message});
        return res.status(200).json({success:true,students:data.students});

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}


export async function saveScore(req,res){
    try {
        const data = req.body;
        if(!data) return res.status(400).json({success:false,message:"ID not exist!!!"});
        const isSaveScore = await scoreServices.saveScore(data);
        if(!isSaveScore.success) return res.status(400).json({success:false,message:isSaveScore.message});
        return res.status(200).json({ success: true, message: "Scores updated successfully" });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function getMySchedules(req,res) {
    try {
        const {id} = req.params;
        const data = await scheduleServices.getMySchedules(id);
        if(!data.success) return res.status(400).json({success:false,message:data.message});
        return res.status(200).json({success:true,scheduleData:data.scheduleData})
    } catch (error) {
        console.log(error);
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}


