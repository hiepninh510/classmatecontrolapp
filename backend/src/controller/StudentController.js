import {admin, db} from '../config/firebase.js'
import { formatPhoneNumber,normalPhoneNumber } from './formatController.js';
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as studentServices from '../services/studentServices.js'
import * as scheduleServices from '../services/scheduleServices.js'
import * as scoreServices from "../services/scoreServices.js"

export async function addStudent(req,res) {
    try {
        const {name,phoneNumber,email,code,classId,className} = req.body
        if(!name || !email){
            return res.status(400).json({success:false,message:'Nhập đầy đủ thông tin'})
        }
        const isAddStudent = await studentServices.addStudent(name,phoneNumber,email,code,classId,className);
        if(!isAddStudent.success) return res.status(400).json({success:false,message:isAddStudent.message});
        return res.status(201).json({success:true,message:isAddStudent.message});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Thêm sinh viên không thành công"});
    }
}

export async function assignLesson(req,res){
    try {
        let {phoneNumber,description,subjectId,phoneInstructor} = req.body;
        phoneInstructor = normalPhoneNumber(phoneInstructor);
        const studentQuery = await db.collection('students').where('phoneNumber','==',phoneNumber).get();
        if(studentQuery.empty){
            return res.status(400).json({seccess:false,message:'Không tìm thấy học sinh'});
        };
        const  instructorQuery = await db.collection('users').where('phoneNumber','==',phoneInstructor).get();
        if(instructorQuery.empty){
            return res.status(400).json({seccess:false,message:'Không tìm thấy giảng viên'});
        };
        const lessionsPresent = studentQuery.docs[0].data().lessions || [];
        const instructor = instructorQuery.docs[0].id;
        const newLession = {
            id:`lession_${Date.now()}`,
            description,
            createAt: new Date(),
            done:false,
            instructor,
            subjectId
        }
        lessionsPresent.push(newLession);
        await studentQuery.docs[0].ref.update({'lessions':lessionsPresent});
        return res.status(200).json({success:true,message:'Lesson assigned successfully',lession:newLession});
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false,message:"Giao bài tập thất bại"});
    }
}

export async function getStudentList(req,res) {
    try {
        const {id} = req.params;
        if(!id) return res.status(400).json({success:false,message:"Id not exist!!!"});
        const data = await studentServices.getStudentList(id);
        if(!data.success) return res.status(data.status).json({success:data.success,message:data.message});
        return res.status(data.status).json({success:data.success,student:data.student});
    } catch (error) {
        console.log(error)
        return res.status(500).json({success:false,message:"Lỗi tải danh sách student"});
    }
}

export async function getOneStudent(req,res) {
    try {
        const phoneNumber = req.params.phone;
        const data = await studentServices.getOneStudent(phoneNumber);
        if(!data.success) return res.status(data.status).json({success:data.success,massage:data.massage});
        return res.status(data.status).json({success:data.status,data:data.data});
    } catch (error) {
        console.log(error)
         return res.status(500).json({success:false,message:"Lỗi tìm kiếm sinh viên"});
    }
}

export async function updateStudent(req,res) {
    try {
        const phone = req.params.phone;
        const data = await studentServices.updateStudent(phone);
        if(!data.success) return res.status(data.status).json({success:data.success,message:data.message});
        return res.status(200).json({success:true,message:'Student  update successfully',student:data.student});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Cập nhật thất bại"});
    }
}

export async function deleteStudent(req,res) {
    try {
        const phone = req.params.phone;
        const data = await studentServices.deleteStudent(phone);
        if(!data.success) return res.status(data.status).json({success:data.success,message:data.message});
        return res.status(data.status).json({success:data.success,message:data.message});
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({success:false,message:"Xóa thất bại"});
    }
}

export async function getMyLession(req,res) {
    try {
        const phone = req.query.phone;
        if(!phone) {return res.status(400).json({success:false,message:'Missing phone'})};
        const data = await studentServices.getMyLession(phone);
        if(!data.success) return res.status(data.status).json({success:data.success,message:data.message});
        return res.status(data.status).json({success:data.success,myLessions:data.myLessions});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi tải danh sách bài học"});
    }
}

export async function markLessionDone(req,res) {
    try {
        const {phoneNumber,idLession}= req.body;
        if(!idLession) return res.status(400).json({success:false,message:"Missing ID lession"});
        const data = await studentServices.markLessionDone(phoneNumber,idLession);
        if(!data.success) return res.status(data.status).json({success:data.success,message:data.message});
        return res.status(data.status).json({success:data.success,message:data.message});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Không thể cập nhật hoàn thành"});
    }
}

export async function editPofile(req,res) {
    try {
    const { phoneNumber, name, email } = req.body; 
    if (!name || !email) return res.status(400).json({success:false, message: "Missing fields" });

    const studentQuery = await db.collection('students').where('phoneNumber','==',phoneNumber).get();
    const userQuery = await db.collection('users').where('phoneNumber','==',phoneFormated).get();
    const accessCodeQuery = await db.collection('accessCodes').where('phoneNumber','==',phoneFormated).get();

    if (studentQuery.empty) return res.status(404).json({ message: "Student not found" });
    if(userQuery.empty) return res.status(404).json({seccess:false,message:'User not found'});
    if(accessCodeQuery.empty) return res.status(404).json({seccess:false,message:'AccessCode not found'});

    await studentQuery.docs[0].ref.update({ name, email });

    return res.status(200).json({success:true, message: "Profile updated" });

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi cập nhật profile"});
    }
}

export async function loginEmail(req,res) {
    try {
       const email = req.body.phoneNumber;
       if(!email) return res.status(400).json({success:false, message:'Email is required'});
       const accessCode = Math.floor(100000+Math.random() * 900000).toString();
       const accessCodeQuery = await db.collection('users').where('email','==',email).get();
       if(accessCodeQuery.empty) return res.status(404).json({ success: true, message: "Email không tồn tại" });
        await accessCodeQuery.docs[0].ref.update({
            accessCode,
            createdAt: new Date(),
        });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Login Code",
      text: `Your access code is: ${accessCode}`,
    });

    return res.json({ success: true, message: "Access code sent to email" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function validateAccessCode(req,res) {
    try {
        const {email,accessCode}=req.body;
        if(!accessCode || !email) return res.status(400).json({success:false,message:'Missing is params'});
        const accessCodeQuery = await db.collection('users')
        .where('email','==',email)
        .where('accessCode','==',accessCode)
        .get()
        if(accessCodeQuery.empty) return res.status(404).json({success:false,message:'AccessCode not true'});
        await accessCodeQuery.docs[0].ref.update({
            accessCode:"",
            lastLogin:new Date()
        });
        const phone = await accessCodeQuery.docs[0].data().phoneNumber
        return res.status(200).json({success:true,message:'Login is Successfully',phoneNumber:formatPhoneNumber(phone)})
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// export async function sentEmailToSetUp(req,res){
//     try {
//         const {name,phoneNumber,email} = req.body;
//         const token = jwt.sign({email,phoneNumber},
//             process.env.JWT_SECRET,
//             {expiresIn: "24h"}
//         );
//         await db.collection("student").doc().set({
//             name,
//             phoneNumber,
//             email,
//             status:"pending",
//             token,
//             createAt:new Date()
//         })
//         const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//             },
//         });
//         const setupLink = `${process.env.FRONTED_PATH}/setup?token=${tonken}`;
//         await transporter.sendMail({
//             from:process.env.EMAIL_USER,
//             to: email,
//             subject:"Setup Your Student Account",
//             html:`<p>Hello ${name},</p>
//                 <p>Your instructor has added you to the classroom system.</p>
//                 <p>Please click the link below to set up your account:</p>
//                 <a href="${setupLink}">${setupLink}</a>
//                 <p>This link will expire in 24 hours.</p>`
//         });
//         res.status(200).json({ success: true, message: "Student added and setup email sent." });
//     } catch (error) {
//         res.status(500).json({ success: false, error: "Internal Server Error" });
//     }
// }

export async function setUpAccount(req,res) {
    try {
        const {token,name,password} =req.body
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { email, phoneNumber } = decoded;
        const hashedPassword = await bcrypt.hash(password, 10);
        const userSnap = await db.collection("users")
        .where("email", "==", email)
        .where("phoneNumber", "==", phoneNumber)
        .limit(1)
        .get();

        if(userSnap.empty) return res.status(400).json({ success: false, error: "User not found" });

        await userSnap.docs[0].ref.update({
            password:hashedPassword
        })

        const snapshot = await db.collection("students")
        .where("email", "==", email)
        .where("phoneNumber", "==", phoneNumber)
        .limit(1)
        .get();

        if (snapshot.empty) {
        return res.status(400).json({ success: false, error: "Student not found" });
        }

        const studentDoc = snapshot.docs[0];
        await studentDoc.ref.update({
            name,
            phoneNumber,
            status:"active",
            token:"",
            deleted:false,
            updatedAt:new Date()
        });


        res.json({ success: true, message: "Account setup successful" });
    } catch (error) {
        console.error(error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ success: false, error: "Token expired" });
    }
    return res.status(400).json({ success: false, error: "Invalid token" }); 
    }
}

// export function testRouter(req,res,next){
//     try {
//         console.log(req.body)
//         console.log("Đi đúng r đó");
//         next();
//     } catch (error) {
//         return res.status(500).json({ success: false, message: "Internal server error" })
//     }
// }


export async function finishLession(req,res){
    try {
        //console.log(req.body)
        const {id,checked,phoneNumber} = req.body;
        const lessionQuery = await db.collection('students').where('phoneNumber','==',normalPhoneNumber(phoneNumber)).get();
        if(lessionQuery.empty) return res.status(400).json({success:false,message:"Student not found"})
        const lessionsData = lessionQuery.docs[0];
        const data = lessionsData.data();
        const updateLession = data.lessions.map(item => item.id === id ? {...item,done:checked} :item);
        await lessionsData.ref.update({lessions:updateLession})
        const updateLessionForUI = await Promise.all(
            updateLession.map(async (lesson) => {
            if (!lesson.instructor) return { ...lesson, instructorName: null };
            const instructorSnap = await db.collection("users").doc(lesson.instructor).get();
            const instructor = instructorSnap.exists ? instructorSnap.data().name : null;
            return {
            ...lesson,
            instructor,
            };
        })
        );
        return res.status(200).json({success:true, updateLessionForUI })
    } catch (error) {
         return res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function getMyScores(req,res) {
    try {
        // console.log(req.params)
        const {id} = req.params;
        if(!id) return res.status(400).json({success:false,message:"Student's ID is Undefined!!!"});
        const data = await scoreServices.getMyScores(id);
        if(!data.success) return res.status(data.status),json({success:data.success,message:data.message});
        return res.status(data.status).json({success:data.success,scoreData:data.scoreData,credits:data.credits});
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function getMyShedules(req,res){
    try {
        const {id} =req.params;
        if(!id) return res.status(400).json({success:false,message:"ID don't exists"});
        const data = await scheduleServices.getMyShedulesOfStudent(id);
        if(!data.success) return res.status(data.status).json({success:data.success,message:data.success});
        return res.status(data.status).json({success:data.success,scheduleData:data.scheduleData});
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
}


