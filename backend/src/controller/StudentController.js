import {db} from '../config/firebase.js'
import { formatPhoneNumber,normalPhoneNumber } from './formatController.js';
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function addStudent(req,res) {
    try {
        const {name,phoneNumber,email} = req.body
        // console.log({name,phoneNumber,email});
        if(!name || !email){
            return res.status(400).json({success:false,message:'Missing fields'})
        }
        const isStudentExisting = await db.collection('students').where('phoneNumber','==',phoneNumber).get();

        if(!isStudentExisting.empty){
            return res.status(400).json({success:false,message:'Student already exists'});
        }
        const token = jwt.sign({email,phoneNumber},
            process.env.JWT_SECRET,
            {expiresIn: "24h"}
        );
        await db.collection('users').add({
            name,
            phoneNumber,
            email,
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
            html:`<p>Hello ${name},</p>
                <p>Your instructor has added you to the classroom system.</p>
                <p>Please click the link below to set up your account:</p>
                <a href="${setupLink}">${setupLink}</a>
                <p>This link will expire in 24 hours.</p>`
        });
        return res.status(201).json({success:true,message:'Student added successfully'});
    } catch (error) {
        console.log(error)
        return res.status(500).json({success:false,error:error.message});
    }
}

export async function assignLesson(req,res){
    try {
        console.log(req.body);
        let {phoneNumber,title,description,phoneInstructor} = req.body;
        phoneInstructor = normalPhoneNumber(phoneInstructor);
        console.log(phoneInstructor);
        if(!title){
            return res.status(400).json({success:false,message:'Title is requied!'});
        }
        const studentQuery = await db.collection('students').where('phoneNumber','==',phoneNumber).get();
        const  instructorQuery = await db.collection('users').where('phoneNumber','==',phoneInstructor).get();
        if(studentQuery.empty || instructorQuery.empty){
            return res.status(400).json({seccess:false,message:'Student or Instructor not found'});
        };
        const lessionsPresent = studentQuery.docs[0].data().lessions || [];
        const instructor = instructorQuery.docs[0].id;
        const newLession = {
            id:`lession_${Date.now()}`,
            title,
            description,
            createAt: new Date(),
            done:false,
            instructor
        }
        lessionsPresent.push(newLession);
        await studentQuery.docs[0].ref.update({'lessions':lessionsPresent});
        return res.status(200).json({success:true,message:'Lesson assigned successfully',lession:newLession});
    } catch (error) {
        return res.status(500).json({success:false,error:error.message});
    }
}

export async function getStudentList(req,res) {
    try {
        const StudentList = await db.collection('students').where('deleted','==',false).get();
        const student = [];
        StudentList.forEach(item =>{
            const data = item.data();
            student.push({
                id:item.id,
                name:data.name,
                phoneNumber:formatPhoneNumber(data.phoneNumber),
                email:data.email
            });
        })
        return res.status(200).json({student});
    } catch (error) {
        return res.status(500).json({success:false,error:error.message});
    }
}

export async function getOneStudent(req,res) {
    try {
        const phoneNumber = req.params.phone;
        const phoneFormated = normalPhoneNumber(phoneNumber);
        const studentQuery = await db.collection('students').where('phoneNumber','==',phoneFormated).get();
        if(studentQuery.empty) return res.status(404).json({success:false,massage:'Student not found'});
        const student = studentQuery.docs[0].data();
        const listLesion = (student.lessions || []).map(item =>({
            title:item.title,
            description:item.description,
            createAt:item.creatAt
        }))
        return res.status(200).json({
            success:true,
            data:{
                name:student.name,
                phoneNumber:formatPhoneNumber(student.phoneNumber),
                email:student.email,
                lessions:listLesion
            }
        })
    } catch (error) {
         return res.status(500).json({success:false,error:error.message});
    }
}

export async function updateStudent(req,res) {
    try {
        const phone = req.params.phone;
        const phoneFormated = normalPhoneNumber(phone);
        const infNeedUpdate = {
            name:req.body.name,
            phoneNumber:normalPhoneNumber(req.body.phoneNumber),
            email:req.body.email
        }
        const studentQuery = await db.collection('students').where('phoneNumber','==',phoneFormated).get();
        const userQuery = await db.collection('users').where('phoneNumber','==',phoneFormated).get();
        const accessCodeQuery = await db.collection('accessCodes').where('phoneNumber','==',phoneFormated).get();
        if(studentQuery.empty)return res.status(404).json({seccess:false,message:'Student not found'});
        if(userQuery.empty) return res.status(404).json({seccess:false,message:'User not found'});
        if(accessCodeQuery.empty) return res.status(404).json({seccess:false,message:'AccessCode not found'});
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
        return res.status(200).json({success:true,message:'Student  update successfully',student});
    } catch (error) {
        return res.status(500).json({success:false,error:error.message});
    }
}

export async function deleteStudent(req,res) {
    try {
        const phone = req.params.phone;
        const phoneFormated = normalPhoneNumber(phone);
        const studentQuery = await db.collection('students').where('phoneNumber','==',phoneFormated).get();
        const userQuery = await db.collection('users').where('phoneNumber','==',phoneFormated).get();
        if(studentQuery.empty){
            return res.status(404).json({seccess:false,message:'Student not found'});
        }
        if(userQuery.empty)  return res.status(404).json({seccess:false,message:'Student not found'});
        await studentQuery.docs[0].ref.update({
            deleted:true,
            deleteDate: new Date()
        });
        await userQuery.docs[0].ref.update({
            deleted:true,
            deleteDate:new Date()
        });
        return res.status(200).json({success:true,message:'Student deleted successfully'});
    } catch (error) {
        return res.status(500).json({success:false,error:error.message});
    }
}

export async function getMyLession(req,res) {
    try {
        const phone = req.query.phone;
        if(!phone) {return res.status(400).json({success:false,message:'Missing phone'})};
        const myPhone = normalPhoneNumber(phone);
        const studentQuery = await db.collection('students').where('phoneNumber','==',myPhone).get();
        const studentData = studentQuery.docs[0].data();
    const lessons = studentData.lessions || [];

    const lessonsWithInstructorName = await Promise.all(
      lessons.map(async (lesson) => {
        if (!lesson.instructor) return { ...lesson, instructorName: null };
        const instructorSnap = await db.collection("users").doc(lesson.instructor).get();
        const instructor = instructorSnap.exists ? instructorSnap.data().name : null;
        return {
          ...lesson,
          instructor,
        };
      })
    );
        if(studentQuery.empty) return res.status(404).json({success:false,message:'Student not found'});
        return res.status(200).json({success:true,myLessions:lessonsWithInstructorName});

    } catch (error) {
        return res.status(500).json({success:false,error:error.message});
    }
}

export async function markLessionDone(req,res) {
    try {
        const {phoneNumber,idLession}= req.body;
        if(!idLession) return res.status(400).json({success:false,message:"Missing ID lession"});
        const studentQuery = await db.collection('students').where('phoneNumber','==',phoneNumber).get();
        if(studentQuery.empty) return res.status(404).json({success:false,message:"Student not found"});
        const myLessions = studentQuery.docs[0].data().lessions ||[];

        const lessionIndex = myLessions.findIndex(item => item.id === idLession);
        console.log(lessionIndex)
        if(lessionIndex ===-1) return res.status(404).json({success:false,message:"Lession not found"});
        myLessions[lessionIndex].done = true;
        await studentQuery.docs[0].ref.update({lessions:myLessions});
        return res.status(200).json({success:true,message:"Lession marked as done"});
    } catch (error) {
        return res.status(500).json({success:false,error:error.message});
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
        return res.status(500).json({success:false,error:error.message});
    }
}

export async function loginEmail(req,res) {
    try {
       const email = req.body.phoneNumber;
       console.log(email)
       if(!email) return res.status(400).json({success:false, message:'Email is required'});
       const accessCode = Math.floor(100000+Math.random() * 900000).toString();
       const accessCodeQuery = await db.collection('users').where('email','==',email).get();
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
        console.log(req.body);
        const {email,accessCode}=req.body;
        console.log({email,accessCode});
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
        console.log(req.body);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        const { email, phoneNumber } = decoded;
        const hashedPassword = await bcrypt.hash(password, 10);
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
            password:hashedPassword,
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
