import { db } from "../config/firebase.js";
import * as classesServices from './classesServices.js';
import * as facultyServices from './facultyServices.js';
import { formatPhoneNumber,normalPhoneNumber } from '../middleware/formatController.js';
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function getAllStudents() {
    try {
        const studentSnap = await db.collection("students").where('deleted','==',false).get();
        if(studentSnap.empty) return false;

        const classes = await classesServices.getAllClasses();
        if(!classes) return false;

        const faculties = await facultyServices.getAllFaculties();
        if(!faculties) return false;

        const students = studentSnap.docs.map(doc => ({id:doc.id,...doc.data()}));

        // console.log("classes",classes)
        // console.log("facultys",facultys)

        const result = students.map(student =>{
            const studentClass = classes.find(c => c.id === student.classId) || {};
            const faculty = faculties.find(f => f.id === studentClass.facultyId) || {};
            
            return {
                id:student.id,
                name: student.name,
                phoneNumber: formatPhoneNumber(student.phoneNumber),
                email: student.email,
                classId: studentClass.id || null,
                className: studentClass.name || null,
                facultyId: faculty.id || null,
                facultyName: faculty.name || null
            }
        })
        return result;        
    } catch (error) {
        throw error;
    }
}

export async function countStudentInClass(theClass) {
    try {
       const studentCount = await db.collection("students").where("classId",'==',theClass).count().get();     
       return studentCount.data().count;    
    } catch (error) {
        throw error;
    }
}

export async function getListStudentToEnterScore(classId,subjectId,id) {
    try {
        const assignmentSnap = await db.collection("assignments")
        .where('classId','==',classId)
        .where('subjectId','==',subjectId)
        .where("instructorId","==",id)
        .get()

        if(assignmentSnap.empty) return {success:false,message:"You haven't been assigned to this class!!!"};

        const classRef = await db.collection('class').doc(classId).get();
        if(!classRef.exists) return {success:false,message:"Class not exist!!!"}

        const studentSnap = await db.collection("students").where('classId','==',classId).get();
        if(studentSnap.empty) return {success:false,message:"List student not found!!!"};

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
        if(!subjectRef.exists) return {success:false,message:"Subject not exist!!!"}

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

        return {success:true,students};

        
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }   
}

export async function addStudent(name,phoneNumber,email,code,classId,className) {
    try {
const isStudentExisting = await db.collection('students')
        .where('phoneNumber','==',phoneNumber)
        .where('email','==',email)
        .get();

        if(!isStudentExisting.empty){
            return {success:false,message:'Sinh viên đã tồn tại'};
        }
        const token = jwt.sign({email,phoneNumber},
            process.env.JWT_SECRET,
            {expiresIn: "24h"}
        );
        await db.collection('users').add({
            code,
            name,
            phoneNumber,
            email,
            password,
            role:'student',
            deleted:false,
            createAt:new Date()
        })
        await db.collection('students').add({
            name,
            phoneNumber,
            email,
            status:"pending",
            token,
            createAt:new Date(),
            lessions:[]
        })

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        const setupLink = `${process.env.FRONTED_PATH}/setup?token=${token}`;
        await transporter.sendMail({
            from:process.env.EMAIL_USER,
            to: email,
            subject:"Setup Your Student Account",
            html:`<p>Hello ${name}</p>
                <p>Mã Số Sinh Viên của bạn là :${code}</p>
                <p>Lớp: ${className}</p>
                <p>Your instructor has added you to the classroom system.</p>
                <p>Please click the link below to set up your account:</p>
                <a href="${setupLink}">${setupLink}</a>
                <p>This link will expire in 24 hours.</p>`
        });
        return {success:true,message:'Thêm học sinh thành công'};        
    } catch (error) {
       throw error; 
    }
}

export async function getStudentList(id) {
    try {
        const instructorSnap = await db.collection("users").doc(id).get();
        if(!instructorSnap.exists) return {status:409,success:false,message:"Instructor not found!!!"};

        const classId = instructorSnap.data().classId;
        // console.log("hello",classId);

        if(!Array.isArray(classId) || classId.length === 0) return {status:200,success:true,student: [] };
        

        const listClassSnap = await db.collection("class")
        .where(admin.firestore.FieldPath.documentId(),'in',classId.slice(0, 10))
        .get()

        const classMap = new Map(listClassSnap.docs.map((doc) => [doc.id,doc.data().name]));

        const StudentList = await db.collection('students')
        .where('deleted','==',false)
        .where("classId","in",classId.slice(0,10))
        .get();
        const student = StudentList.docs.map((doc) => {
        const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                phoneNumber: formatPhoneNumber(data.phoneNumber),
                email: data.email,
                classRoom: classMap.get(data.classId) || null,
            };
    });
        return {status:200,success:true,student};       
    } catch (error) {
        throw error;
    }
}

export async function getOneStudent(phoneNumber) {
    try {
        const phoneFormated = normalPhoneNumber(phoneNumber);
        const studentQuery = await db.collection('students').where('phoneNumber','==',phoneFormated).get();
        if(studentQuery.empty) return {status:404,success:false,massage:'Student not found'};
        const student = studentQuery.docs[0].data();
        const listLesion = (student.lessions || []).map(item =>({
            title:item.title,
            description:item.description,
            createAt:item.creatAt
        }))
        return {
            status:200,
            success:true,
            data:{
                name:student.name,
                phoneNumber:formatPhoneNumber(student.phoneNumber),
                email:student.email,
                lessions:listLesion
            }
        }       
    } catch (error) {
        throw error;
    }
}

export async function updateStudent(phone) {
    try {
        const phoneFormated = normalPhoneNumber(phone);
        const infNeedUpdate = {
            name:req.body.name,
            phoneNumber:normalPhoneNumber(req.body.phoneNumber),
            email:req.body.email
        }
        const studentQuery = await db.collection('students').where('phoneNumber','==',phoneFormated).get();
        const userQuery = await db.collection('users').where('phoneNumber','==',phoneFormated).get();
        const accessCodeQuery = await db.collection('accessCodes').where('phoneNumber','==',phoneFormated).get();
        if(studentQuery.empty)return {status:404,success:false,message:'Student not found'};
        if(userQuery.empty) return {status:404,success:false,message:'User not found'};
        if(accessCodeQuery.empty) return {status:404,success:false,message:'AccessCode not found'};
        await studentQuery.docs[0].ref.update(infNeedUpdate);
        await userQuery.docs[0].ref.update(infNeedUpdate);
        await accessCodeQuery.docs[0].ref.update({name:infNeedUpdate.name,phoneNumber:infNeedUpdate.phoneNumber});
        const updatedStudentDoc = await studentQuery.docs[0].ref.get();
        const student = {
            id:studentQuery.docs[0].id,
            name:updatedStudentDoc.data().name,
            phoneNumber:formatPhoneNumber(updatedStudentDoc.data().phoneNumber),
            email:updatedStudentDoc.data().email
        }
        return {status:200,success:true,message:'Student  update successfully',student};
    } catch (error) {
        throw error
    }
}

export async function deleteStudent(phone) {
    try {
const phoneFormated = normalPhoneNumber(phone);
        const studentQuery = await db.collection('students').where('phoneNumber','==',phoneFormated).get();
        const userQuery = await db.collection('users').where('phoneNumber','==',phoneFormated).get();
        if(studentQuery.empty){
            return {status:404,seccess:false,message:'Student not found'};
        }
        if(userQuery.empty)  return {status:404,seccess:false,message:'Student not found'};
        await studentQuery.docs[0].ref.update({
            deleted:true,
            deleteDate: new Date()
        });
        await userQuery.docs[0].ref.update({
            deleted:true,
            deleteDate:new Date()
        });
        return {status:200,success:true,message:'Student deleted successfully'};    
    } catch (error) {
       throw error; 
    }  
}

export async function getMyLession(phone) {
    try {
        const myPhone = normalPhoneNumber(phone);
        const studentQuery = await db.collection('students').where('phoneNumber','==',myPhone).get();
        if(studentQuery.empty) return {status:404,success:false,message:"Sinh viên không tồn tại"};
        const studentData = studentQuery.docs[0].data();
        const lessons = studentData.lessions || [];

        const lessonsWithInstructorName = await Promise.all(
        lessons.map(async (lesson) => {
            if (!lesson.instructor) return { ...lesson, instructorName: null };
            const instructorSnap = await db.collection("users").doc(lesson.instructor).get();
            const instructorName = instructorSnap.exists ? instructorSnap.data().name : null;
            const subjectSnap = await db.collection("subjects").doc(lesson.subjectId).get();
            const title = subjectSnap.exists? subjectSnap.data().name : null
            return {
            ...lesson,
            instructorName,
            title
            };
        })
        );
        if(studentQuery.empty) return {status:404,success:false,message:'Student not found'};
        return {status:200,success:true,myLessions:lessonsWithInstructorName};       
    } catch (error) {
        throw error;
    }
}

export async function markLessionDone(phoneNumber,idLession) {
    try {
        const studentQuery = await db.collection('students').where('phoneNumber','==',phoneNumber).get();
        if(studentQuery.empty) return {status:404,success:false,message:"Student not found"};
        const myLessions = studentQuery.docs[0].data().lessions ||[];

        const lessionIndex = myLessions.findIndex(item => item.id === idLession);
        if(lessionIndex ===-1) return {status:404,success:false,message:"Lession not found"};
        myLessions[lessionIndex].done = true;
        await studentQuery.docs[0].ref.update({lessions:myLessions});
        return {status:200,success:true,message:"Lession marked as done"};      
    } catch (error) {
        throw error;
    }
}