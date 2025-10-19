import {db} from '../config/firebase.js';
import { formatPhoneNumber } from './formatController.js';

function generateId(length = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}


export async function getAllStudent(req,res) {
    try {
        const studentSnap = await db.collection("students").where('deleted','==',false).get();
        if(studentSnap.empty) return res.status(404).json({success:false,message:"Student is not existing!!!"});

        const classSnap = await db.collection('class').get();
        if(classSnap.empty) return res.status(404).json({success:false,message:"Class is not existing!!!"});

        const facultySnap = await db.collection("facultys").get();
        if(facultySnap.empty) return res.status(404).json({success:false,message:"Faculty is not existing!!!"});

        const students = studentSnap.docs.map(doc => ({id:doc.id,...doc.data()}));
        const classes = classSnap.docs.map(doc => ({id:doc.id,...doc.data()}));
        const facultys = facultySnap.docs.map(doc => ({id:doc.id,...doc.data()}));

        // console.log("classes",classes)
        // console.log("facultys",facultys)

        const result = students.map(student =>{
            const studentClass = classes.find(c => c.id === student.classId) || {};
            const faculty = facultys.find(f => f.id === studentClass.facultyId) || {};
            
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
        // console.log(result)
        return res.status(200).json({success:true,result});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function  getAllClasses(req,res) {
    try {
       const classSnap = await db.collection("class").where("isDelete",'==',false).get();
       if(classSnap.empty) return res.status(404).json({success:false,message:"Class is not existing!!!"});

       const flapMapclasses = classSnap.docs.map(c => ({id:c.id,...c.data()}));
       const classFillter = await Promise.all(
        flapMapclasses.map(async(item)=>{
            const studentCount = await db.collection("students").where("classId",'==',item.id).count().get();
            const facultySnap = await db.collection("facultys").doc(item.facultyId).get();
            if(studentCount && facultySnap.exists) {
                return {
                faculty:facultySnap.data(),
                classSize:studentCount.data().count,
                ...item
            }} else return null;
        }));
        const classes = classFillter.filter(Boolean);
       return res.status(200).json({success:true,classes});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function getAllRoom(req,res) {
    try {
        const roomRef = await db.collection("rooms").get();
        if(roomRef.empty) return res.status(200).json({success:false,message:"Lỗi fetch data"});
        const rooms = roomRef.docs.map(doc=>({id:doc.id,...doc.data()}));
        return res.status(200).json({success:true,rooms});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function getAllTimeFrames(req,res) {
    try {
        const timeFrameSnap = await db.collection("times").get();
        if(timeFrameSnap.empty) return res.status(200).json({success:false,message:"Không thể tải danh sách ca học"});
        const timeFrames = timeFrameSnap.docs.map(doc =>({id:doc.id,...doc.data()}))
        return res.status(200).json({success:true,timeFrames});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}


async function getClassesListByInstructorId(listID) {
    try {
        if(!Array.isArray(listID) || listID.length <= 0) return [];

        const validIDs = listID.filter((id) => typeof id === "string" && id.trim() !== "");
        if (validIDs.length === 0) return [];

        const classesSnap = await Promise.all(
            listID.map(async (item) => {
                const itemSnap = await db.collection("class").doc(item).get();
                if(itemSnap.exists) {
                    return {
                        id:itemSnap.id,
                        ...itemSnap.data()
                    }
                } else return [];
            })
        )

        const classes = classesSnap.filter(Boolean);
        return classes;
    } catch (error) {
        return [];
    }
}

async function getSubjectsListByInstructorId(listID) {
    try {
        if(!Array.isArray(listID) || listID.length <= 0) return [];

        const validIDs = listID.filter((id) => typeof id === "string" && id.trim() !== "");
        if (validIDs.length === 0) return [];

        const subjectsSnap = await Promise.all(
            listID.map(async (item) => {
                const itemSnap = await db.collection("subjects").doc(item).get();
                if(itemSnap.exists) {
                    return {
                        id:itemSnap.id,
                        ...itemSnap.data()
                    }
                } else return [];
            })
        )

        const subjects = subjectsSnap.filter(Boolean);
        return subjects;
    } catch (error) {
        return []
    }
}

async function getFacultyByInstructorId(id) {
    try {
        if(!id) return null;
        const facultySnap = await db.collection("facultys").doc(id).get();
        if(!facultySnap.exists) return null;
        return {id:facultySnap.id,...facultySnap.data()}
    } catch (error) {
        return null
    }
}

export async function getAllIntructors(req,res) {
    try {
        const instructorSnap = await db.collection('users')
        .where("role",'==','instructor')
        .where("deleted","==",false)
        .get();

        if(instructorSnap.empty) return res.status(404).json({success:false,message:"Instructor is not existing!!!"});

        const instructors = instructorSnap.docs.map(i => ({id:i.id,...i.data()}));
        const instructorsWithDetails = await Promise.all(
        instructors.map(async (ins) => {
            const classes = await getClassesListByInstructorId(ins.classId || []);
            const subjects = await getSubjectsListByInstructorId(ins.subjectId || []);
            const faculty = await getFacultyByInstructorId(ins.facultyId)
            return {
            id:ins.id,
            name:ins.name,
            phoneNumber:formatPhoneNumber(ins.phoneNumber),
            code:ins.code,
            email:ins.email,
            faculty,
            classes: classes || [],
            subjects: subjects || []
        }}))
        // console.log(instructorsWithDetails)
        return res.status(200).json({success:true,instructorsWithDetails});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function getAllSubjects(req,res) {
    try {
        const subjectSnap = await db.collection("subjects").get();
        if(subjectSnap.empty)  return res.status(404).json({success:false,message:"Subject is not existing!!!"});

        const subjects = subjectSnap.docs.map(sb=>({id:sb.id,...sb.data()}));
        return res.status(200).json({success:true,subjects});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}


export async function getAllFaculties(req,res) {
    try {
        const facultySnap = await db.collection('facultys').get();

        if(facultySnap.empty) return res.status(404).json({success:false,message:"Facultys is not existing!!!"});

        const facultys = facultySnap.docs.map(i => ({id:i.id,...i.data()}));
        return res.status(200).json({success:true,facultys});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

async function getEarliesPhase(){
    const snapshot = await db.collection("phases")
    .orderBy("creatAt", "asc") // sắp xếp tăng dần → document đầu tiên là sớm nhất
    .limit(1)
    .get();
    if(snapshot.empty) return null;
    return {id:snapshot.docs[0].id,...snapshot.docs[0].data()}
}

// Thêm instructor
export async function createInstructor(req,res) {
    try {
        const {name,phoneNumber,email,code,classes,subjects,faculty} = req.body;
        console.log("req.body",req.body);
        if(!name || !email || !code){
            return res.status(400).json({success:false,message:'Missing fields'})
        }
        const isUserExisting = await db.collection('users')
        .where('phoneNumber','==',phoneNumber)
        .where('email','==',email)
        .where("code","==",code)
        .get();

        if(!isUserExisting.empty){
            return res.status(400).json({success:false,message:'Instructor already exists'});
        }
        const phase = await getEarliesPhase();

        const teachingAssignmentSnap = await db.collection("teachingAssignments")
        .where('classId',"in",classes)
        .where("subjectId","in",subjects)
        .where("phaseId",'==',phase.id)
        .get()

        if(!teachingAssignmentSnap.empty) return res.status(404).json({success:false,message:"Lớp và Môn này đã được phân công!!!"})
        
        await db.collection('users').add({
            code,
            name,
            phoneNumber,
            email,
            deleted:false,
            facultyId:faculty,
            classId:classes,
            subjectId:subjects,
            role:'instructor',
            createAt:new Date()
        });
        return res.status(201).json({success:true,message:'Instructor added successfully'});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function deleteInstructor(req,res) {
    try {
        const {id} = req.params;
        if(!id) return res.status(400).json({success:false,message:"Id rỗng"});
        const userRef = await db.collection("users").doc(id).get();
        if(userRef.exists){
            await userRef.ref.update({
                deleted:true
            })
        }
        return res.status(200).json({success:true,message:"Delete success!"})
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}


export async function updateInstructor(req,res) {
    try {
        const {id} = req.params;
        const values = req.body;
        if(!id || !values) return res.status(400).json({success:false,message:'Missing fields'});
        const instructorRef = await db.collection("users").doc(id).get();
        if(!instructorRef.exists)  return res.status(404).json({ success: false, message: "Instructor not found" });

        const { classes, subjects, ...rest } = values;
        await instructorRef.ref.update({
            ...rest,
            classId:classes,
            subjectId:subjects
        });

        return res.status(200).json({success:true,message:"Update success!"})
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
} 

export async function deleteOneClass(req,res) {
    try {
        const {id} = req.params;
        if(!id) return res.status(400).json({success:false,message:"Id rỗng"});
        const classRef = await db.collection("class").doc(id).get();
        if(classRef.exists) {
            await classRef.ref.update({
                isDelete:true
            })
        }
        return res.status(200).json({success:true,message:"Delete success!"})
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function creatClass(req,res) {
    try {
        const values = req.body;
        if(!values) return res.status(400).json({success:false,message:"Thông tin trỗng"});
        const classesSnap = await db.collection("class").where("name",'==',values.name).get();
        if(!classesSnap.empty) res.status(401).json({success:false,message:"Lớp đã tồn tại"});
        await db.collection("class").add({
            ...values,
            isDelete:false
        })
        return res.status(201).json({success:true,message:"Thêm thành công"});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function updateRoomStatus(req,res) {
    try {
        const {id} = req.params;
        const {active} = req.body;
        if(!id) return res.status(400).json({success:false,message:"Id rỗng"});
        const roomRef = await db.collection("rooms").doc(id).get();
        if(roomRef.exists) {
            roomRef.ref.update({
                active
            })
        } else res.status(200).json({success:false,message:"Update fail!"})
        return res.status(200).json({success:true,message:"Update success!"})
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function addRoom(req,res) {
    try {
        const values = req.body;
        if(!values || Object.keys(values).length ===0) return res.status(200).json({success:false,message:"Dữ liệu rỗng"});
        const docRef = await db.collection('rooms').add({
            ...values
        })

        const newRoomSnap = await docRef.get();
        const newRoom = { id: docRef.id, ...newRoomSnap.data() };
        return res.status(200).json({success:true,newRoom})
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function getSchedulesFromFaculties(req,res){
    try {
        const {facultyId} = req.params;
        if(!facultyId) return res.status(400).json({success:false,message:"Dữ liệu rỗng"});

        const facultieRef = await db.collection("facultys").doc(facultyId).get();
        if(!facultieRef.exists) return res.status(404).json({success:false,message:"Khoa khong tồn tại"});
        const faculties = {id:facultieRef.id,...facultieRef.data()}

        const classSnap = await db.collection("class")
        .where("facultyId",'==',facultyId)
        .get();
        
        if(classSnap.empty) return res.status(400).json({success:false,message:"Class rỗng"});
        const classes = classSnap.docs.map(doc => ({id:doc.id,...doc.data()}));
        const classIds = classes.map(c => c.id);

        const instructorSnap = await db
            .collection("users")
            .where("deleted", "==", false)
            .where("role", "==", "instructor")
            .get();

        const instructors = instructorSnap.docs
        .map((doc) => ({id:doc.id,...doc.data()}))
        .filter((ins)=>
            Array.isArray(ins.classId) && ins.classId.some((cid)=> classIds.includes((cid)))
        )

        const instructorId = instructors.map(item => item.id);

        const subjectSnap = await db.collection("subjects").where("facultyId","==",facultyId).get();
        if(subjectSnap.empty) return res.status(400).json({success:false,message:"Subject rỗng"});
        const subjects = subjectSnap.docs.map(doc=>({id:doc.id,...doc.data()}));

        let chucked = [];
        for(let i=0;i<instructorId.length;i+=10){
            chucked.push(instructorId.slice(i,i+10));
        }

        const shedulesSnap = await Promise.all(
            chucked.map(ids=> db.collection("schedules").where("instructorId","in",ids).get())
        );
        const schedulesDocs = shedulesSnap.flatMap(snap=>
            snap.docs.map(doc =>({id:doc.id,...doc.data()}))
        );

        const roomSnap = await db.collection("rooms").get();
        const timeSnap = await db.collection("times").get();

        const rooms = roomSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const times = timeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const schedules = schedulesDocs.flatMap(sch =>{
            const instructor = instructors.find(i => i.id === sch.instructorId);
            const instructorName  = instructor?.name || "";
            const instructorId =instructor?.id

            return sch.schedule.map(s =>{
                const classData = classes.find(c => c.id === s.classId);
                const subjectData = subjects.find(sb => sb.id === s.subjectId);
                const roomData = rooms.find(r => r.id === s.roomId);
                const timeData = times.find(t => t.id === s.timeId);

                return {
                    id: sch.id,
                    idS: s.idS,
                    active: s.active,
                    classId: s.classId,
                    dayOfWeek: s.dayOfWeek,
                    roomId: s.roomId,
                    subjectId: s.subjectId,
                    timeId: s.timeId,
                    startDate: s.startDate,
                    endDate: s.endDate,
                    timeFrame: timeData?.timeFrame || "",
                    className: classData?.name || "",
                    subjectName: subjectData?.name || "",
                    roomName: roomData?.name || "",
                    instructorName,
                    instructorId,
                    facultyId:faculties.id,
                    facultyName:faculties.name
                };
                })
            })
        return res.status(200).json({ success: true, schedules });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function getSchedulesWithCodeFacultyId(req,res) {
    try {
        const {code,facultyId} = req.query;
        if(!code || !facultyId) return res.status(400).json({success:false,message:"Dữ liệu rỗng"});

        const facultieRef = await db.collection("facultys").doc(facultyId).get();
        if(!facultieRef.exists) return res.status(400).json({success:false,message:"Khoa khong tồn tại"});
        const faculties = {id:facultieRef.id,...facultieRef.data()}

        const instructorSnap = await db.collection("users").where("code","==",code).get();
        if(instructorSnap.empty) return
        const instructorDoc = instructorSnap.docs[0];
        const instructor = { id: instructorDoc.id, ...instructorDoc.data() };

        const scheduleSnap = await db.collection("schedules").where("instructorId","==",instructor.id).get();
        if(scheduleSnap.empty) return
        const scheduleDocs = scheduleSnap.docs.map(doc =>({id:doc.id,...doc.data()}));
        const scheduleData = scheduleDocs.flatMap(doc => 
            doc.schedule.map(sch => ({ ...sch, id: doc.id }))
        );

        const subjectsSnap = await db.collection("subjects").where("facultyId","==",facultyId).get();
        if(subjectsSnap.empty) return
        const subjects = subjectsSnap.docs.map(doc=>({id:doc.id,...doc.data()}));

        const classSnap = await db.collection("class").where("facultyId",'==',facultyId).get();
        if(classSnap.empty) return
        const classes = classSnap.docs.map(doc=>({id:doc.id,...doc.data()}));

        const roomSnap = await db.collection("rooms").get();
        if(roomSnap.empty) return
        const rooms = roomSnap.docs.map(doc => ({id:doc.id,...doc.data()}));

        const timeSnap = await db.collection("times").get();
        if(timeSnap.empty) return
        const times = timeSnap.docs.map(doc => ({id:doc.id,...doc.data()}));


        const schedules = scheduleData.map(sch=>{
            const subject = subjects.find(sb=> sb.id === sch.subjectId);
            const room = rooms.find(r => r.id === sch.roomId);
            const classe = classes.find(cls => cls.id === sch.classId);
            const timeData = times.find(t=>t.id === sch.timeId);


            return {
                id: sch.id,
                idS:sch.idS,
                active: sch.active,
                classId: sch.classId,
                dayOfWeek: sch.dayOfWeek,
                days: sch.dayOfWeek,
                roomId: sch.roomId,
                subjectId: sch.subjectId,
                timeId: sch.timeId,
                startDate: sch.startDate,
                endDate: sch.endDate,
                timeFrame: timeData?.timeFrame || "",
                className: classe?.name || "",
                subjectName: subject?.name || "",
                roomName: room?.name || "",
                instructorName: instructor.name,
                instructorId:instructor.id,
                facultyId:faculties.id,
                facultyName:faculties.name
            }
        })
        return res.status(200).json({ success: true, schedules });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function deleteSchedules(req,res) {
    try {
        const {id}=req.params;
        const {classId, subjectId ,dayOfWeek} = req.body;
        if(!id || !classId || !subjectId || !dayOfWeek) return
        const scheduleSnap =  await db.collection("schedules").doc(id).get();
        if(!scheduleSnap.exists) return res.status(404).json({ success: false, message: "Schedule document not found" });
        const scheduleData = scheduleSnap.data();

        if (!Array.isArray(scheduleData.schedule)) {
            return res
                .status(400)
                .json({ success: false, message: "Dữ liệu schedules không hợp lệ" });
        }

            const updatedSchedules = data.schedule.map((item) => {
            if (
                item.classId === classId &&
                item.subjectId === subjectId &&
                item.dayOfWeek === dayOfWeek
            ) {
                return { ...item, active: false }; // cập nhật active
            }
            return item;
            });

        await docRef.update({ schedules: updatedSchedules });

        return res.status(200).json({
        success: true,
        message: "Đã cập nhật trạng thái active thành false",
        });

    } catch (error) {
        console.error("Lỗi khi cập nhật schedule:", error);
        return res.status(500).json({success:false,message:"Lỗi"});
            
    }
}


export async function addSchedule(req, res) {
  try {
    const values = req.body;
    const allSchedulesSnap = await db.collection("schedules").get();
    let duplicateClassSubject = false;

    // Kiểm tra lớp-môn đã có giảng viên khác dạy chưa
    allSchedulesSnap.forEach(doc => {
      const schList = doc.data().schedule || [];
      const found = schList.some(sch =>
        sch.classId === values.classId && sch.subjectId === values.subjectId
      );
      if (found) duplicateClassSubject = true;
    });

    if (duplicateClassSubject) {
      return res.status(400).json({
        success: false,
        message: "Lớp học này đã có giảng viên khác dạy môn này.",
      });
    }

    const schedulesSnap = await db
      .collection("schedules")
      .where("instructorId", "==", values.instructorId)
      .get();

    // Tách dayOfWeek ra từng phần tử
    const dayArray = Array.isArray(values.dayOfWeek) ? values.dayOfWeek : [values.dayOfWeek];

    // Mỗi ngày trong dayOfWeek sẽ thành 1 object riêng
    const scheduleItems = dayArray.map(day => ({
      idS: generateId(),
      classId: values.classId,
      roomId: values.roomId,
      dayOfWeek: [day],       // chỉ 1 phần tử
      timeId: values.timeFrame,
      startDate: values.startDate,
      subjectId: values.subjectId,
      endDate: values.endDate,
      active: values.active,
    }));

    if (schedulesSnap.empty) {
      // Nếu giảng viên chưa có document → tạo mới với mảng scheduleItems
      await db.collection("schedules").add({
        instructorId: values.instructorId,
        type: "instructor",
        schedule: scheduleItems,
      });
      return res.status(200).json({ success: true, values });
    }

    const docRef = schedulesSnap.docs[0].ref;
    const scheduleData = schedulesSnap.docs[0].data().schedule;

    const hasOverlapDay = (days1, days2) => days1.some(d => days2.includes(d));

    // Kiểm tra trùng lịch/room với từng item mới
    const isConflict = scheduleItems.some(newSch =>
      scheduleData.some(sch => {
        const sameTime = sch.timeId === newSch.timeId;
        const sameDay = hasOverlapDay(sch.dayOfWeek || [], newSch.dayOfWeek || []);
        const sameRoom = sch.roomId === newSch.roomId;
        const sameInstructor = sch.instructorId === values.instructorId;
        return sameTime && sameDay && (sameInstructor || sameRoom);
      })
    );

    if (isConflict) {
      return res.status(400).json({
        success: false,
        message: "Bị trùng lịch dạy hoặc trùng phòng học trong khung giờ này.",
      });
    }

    // Update: ghép mảng mới vào mảng cũ
    await docRef.update({
      schedule: [...scheduleData, ...scheduleItems],
    });

    return res.status(200).json({ success: true, values });
  } catch (error) {
    console.error("Lỗi khi thêm schedule:", error);
        return res.status(500).json({success:false,message:"Lỗi"});
  }
}

export async function updateSchedule(req, res) {
  try {
    const values = req.body;
    const { idS } = req.params;


    // Lấy document schedules của giảng viên
    const schedulesSnap = await db
      .collection("schedules")
      .where("instructorId", "==", values.instructorId)
      .get();

    if (schedulesSnap.empty) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch của giảng viên này.",
      });
    }

    const scheduleRef = schedulesSnap.docs[0].ref;
    const scheduleData = schedulesSnap.docs[0].data().schedule || [];

    // Hàm kiểm tra trùng lịch
    const hasConflict = (scheduleList, newValues, excludeIdS) => {
      const hasOverlapDay = (days1, days2) =>
        days1.some((d) => days2.includes(d));

      return scheduleList.some((sch) => {
        if (sch.idS === excludeIdS) return false;
        const sameTime = sch.timeFrame === newValues.timeFrame;
        const sameDay = hasOverlapDay(
          sch.dayOfWeek || [],
          newValues.dayOfWeek || []
        );
        const sameRoom = sch.roomId === newValues.roomId;
        const sameInstructor = sch.instructorId === newValues.instructorId;
        return sameTime && sameDay && (sameInstructor || sameRoom);
      });
    };

    if (hasConflict(scheduleData, values, idS)) {
      return res.status(400).json({
        success: false,
        message: "Bị trùng lịch dạy hoặc trùng phòng học trong khung giờ này.",
      });
    }

    // Tìm index lịch cần update
    const indexScheduleUpdate = scheduleData.findIndex((s) => s.idS === idS);
    if (indexScheduleUpdate === -1) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch cần cập nhật.",
      });
    }

    // Lấy các snapshot liên quan
    const [classSnap, instructorSnap, roomSnap, timeSnap, subjectSnap, facultySnap] =
      await Promise.all([
        db.collection("class").doc(values.classId).get(),
        db.collection("users").doc(values.instructorId).get(),
        db.collection("rooms").doc(values.roomId).get(),
        db.collection("times").doc(values.timeFrame).get(),
        db.collection("subjects").doc(values.subjectId).get(),
        db.collection("facultys").doc(values.facultyId).get(),
      ]);

    // Hàm validate snapshot
    const validateSnapshot = (snap, name) => {
      if (!snap.exists) {
        throw new Error(`${name} không tồn tại`);
      }
    };

    try {
      validateSnapshot(classSnap, "Class");
      validateSnapshot(instructorSnap, "Instructor");
      validateSnapshot(roomSnap, "Room");
      validateSnapshot(timeSnap, "Time");
      validateSnapshot(subjectSnap, "Subject");
      validateSnapshot(facultySnap, "Faculty");
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    // Cập nhật schedule
    const updatedSchedule = [...scheduleData];
    const valueUpdate = {
      idS,
      classId: values.classId,
      roomId: values.roomId,
      dayOfWeek: values.dayOfWeek,
      timeId: values.timeFrame,
      startDate: values.startDate,
      subjectId: values.subjectId,
      endDate: values.endDate,
      active:values.active
    };
    updatedSchedule[indexScheduleUpdate] = {
      ...updatedSchedule[indexScheduleUpdate],
      ...valueUpdate,
    };

    // Chuẩn bị dữ liệu trả về UI
    const valuesForUI = {
      ...valueUpdate,
      id: scheduleRef.id,
      className: classSnap.data()?.name,
      subjectName: subjectSnap.data()?.name,
      instructorId: instructorSnap.id,
      instructorName: instructorSnap.data()?.name,
      roomName: roomSnap.data()?.name,
      timeFrame: timeSnap.data()?.timeFrame,
      facultyId: facultySnap.id,
      facultyName: facultySnap.data()?.name,
    };

    await scheduleRef.update({ schedule: updatedSchedule });

    return res.status(200).json({ success: true, valuesForUI });
  } catch (error) {
        console.error("Lỗi khi cập nhật schedule:", error);
        return res.status(500).json({success:false,message:"Lỗi"});
  }
}

export async function getFacultiesForAdmin(req,res){
    try {
        const facultiesSnap = await db.collection("facultys")
        .where("active",'==',true)
        .where("isDelete",'==',false)
        .get();

        if(facultiesSnap.empty) return res.status(404).json({ success: false, message:"Không có khoa nào còn hoạt động" });
        const facultiesData = facultiesSnap.docs.map(doc=>({id:doc.id,...doc.data()}));
        const classSanp = await db.collection("class").where("isDelete","==",false).get();
        const instructorSnap = await db.collection("users")
        .where("deleted",'==',false)
        .where("role","==","instructor")
        .get();
        const classData = classSanp.docs.map(doc=>({id:doc.id,...doc.data()}));
        const instructorData = instructorSnap.docs.map(doc=>({id:doc.id,...doc.data()}));
        const faculties = facultiesData.map(f=>{
            const classFitter = classData.filter(cls=> cls.facultyId === f.id);
            const instructorFilter = instructorData.filter(ins=> ins.facultyId === f.id);
            const dean = instructorData.find((ins) => ins.id === f.deanId);

            return {
                ...f,
                classNumber:classFitter.length,
                instructorNumber:instructorFilter.length,
                dean:dean ? dean.name : null,
            }
        })
         return res.status(200).json({ success: true, faculties });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function addFaculty(req,res) {
    try {
        const values = req.body;
        await db.collection("facultys").add({...values,isDelete:false});
        return res.status(200).json({ success: true, values });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function updateFaculty(req,res) {
    try {
        const values = req.body;
        const {id} = req.params;

        const facultieRef = await db.collection("facultys").get();
        const facultiesData = facultieRef.docs.map(doc => ({id:doc.id,...doc.data()}));
        const isDeanId = facultiesData.filter(f => f.deanId === values.deanId);
        if(isDeanId.length >0) return res.status(409).json({success:false,message:"Giảng viên này đã là trưởng khoa"});

        const facultySnap = await db.collection("facultys").where("code",'==',id).get();
        if (facultySnap.empty) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy khoa có mã " + id,
            });
        }
        const updateValues = {
            ...values,
            deanId: values.deanId === undefined ? null : values.deanId
        }
        const docRef = facultySnap.docs[0].ref;

        await docRef.update(updateValues);

        const updatedFacultySnap = await docRef.get();

        return res.status(200).json({
        success: true,
        values: { id: updatedFacultySnap.id, ...updatedFacultySnap.data() },
        });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function deleteFaculty(req,res) {
    try {
       const {id} = req.params;
       const facultySnap = await db.collection("facultys").doc(id).get()
       if(!facultySnap.exists) return res.status(409).json({success:false,message:"Khoa này không tồn tại"});
       await facultySnap.ref.update({isDelete:true});
       return res.status(200).json({success:true,message:"Xóa khoa thành công"});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}


export async function addphases(req,res) {
    try {
        const values = req.body;
        const existingPhaseSnap = await db.collection("phases").where("name", "==", values.name).get();
        if (!existingPhaseSnap.empty) {
            return res.status(409).json({
                success: false,
                message: "Học kỳ này đã tồn tại.",
            });
        }
         const docRef = await db.collection("phases").add({
            ...values,
            createdAt: new Date(),
        });

        const newDoc = await docRef.get();

        return res.status(201).json({
        success: true,
        message: "Tạo học kỳ thành công.",
        data: { id: newDoc.id, ...newDoc.data() },
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

async function countInstructor(id) {
    try {
        //const subjectRef = await db.collection("subjects").doc(id).get();
        const instructorSnap = await db.collection("users")
        .where("role",'==',"instructor")
        .where("deleted",'==',false)
        .where("subjectId", "array-contains", id)
        .get();

        const instructorNumber = instructorSnap.size; 

        return instructorNumber;
    } catch (error) {
        return null
    }
}

export async function getSubjectForAdmin(req,res) {
    try {
        const subjectSnap = await db.collection("subjects").where("isDelete",'==',false).get();
        if(subjectSnap.empty) return res.status(404).json({success:false,message:"Không tồn tại môn học nào"});
        const subjectData = subjectSnap.docs.map(doc=>({id:doc.id,...doc.data()}));
        const instructorSnap = await db.collection("users")
        .where("role",'==','instructor')
        .where("deleted",'==',false)
        .get();
        const instructorData = instructorSnap.docs.map(doc => ({id:doc.id,...doc.data()}));
        // const subjects = subjectData.map(sb => {
        //     let instructorNumber = 0;
        //     instructorData.forEach(ins =>{
        //         const isCount =  ins.subjectsId.includes(sb.id);
        //         if(isCount) instructorNumber++;
        //     });
        //     return {
        //         ...sb,
        //         instructorNumber
        //     }
        // });
        const subjects = subjectData.map(sb => ({
            ...sb,
            instructorNumber: instructorData.filter(
                ins => Array.isArray(ins.subjectId) && ins.subjectId.includes(sb.id)
            ).length
        }));
        return res.status(200).json({success:true,subjects});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}


export async function addSubject(req,res) {
    try {
        const values = req.body;
        const data = {
            ...values,
            isDelete:false,
            active:true
        }
        await db.collection("subjects").add(data);
        const subject = {...data,instructorNumber:0};
        return res.status(200).json({success:true,subject})
        
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function updateSubject(req,res) {
    try {
        const {id} = req.params;
        const values = req.body;
        console.log("id",id);
        console.log("values",values)
        const subjectRef = db.collection("subjects").doc(id);
        const subjectData = await subjectRef.get();
        if(!subjectData.exists) return res.status(404).json({success:false,message:"Subjects is not existsing"});
        await subjectData.ref.update(values)
        const updatedSnap = await subjectRef.get();
        const instructorNumber = await countInstructor(id);
        const subject = {
            id:updatedSnap.id,
            ...updatedSnap.data(),
            instructorNumber
        }
        return res.status(200).json({success:true,subject})
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}


export async function deleteSubject(req,res) {
    try {
        const id = req.query.id;
        const subjectSnap = await db.collection("subjects").doc(id).get();
        if(!subjectSnap.exists) return res.status(400).json({success:false,message:'Môn học không tồn tại'});
        await subjectSnap.ref.update({isDelete:true});
        return res.status(200).json({success:true,message:"Xóa thành công"})
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}
