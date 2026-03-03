import {db} from '../config/firebase.js';
import * as subjectServices from '../services/subjectServices.js';
import * as instructorServices from '../services/instructorServices.js';
import * as teachingAssignmentServices from '../services/teachAssignmentsServices.js';
import * as phaseServices from '../services/phaseServices.js';
import * as studentServices from '../services/studentServices.js';
import * as classesServices from '../services/classesServices.js';
import * as roomServices from '../services/roomServices.js';
import * as timeFrameServices from '../services/timeFramesServices.js';
import * as facultyServices from '../services/facultyServices.js';
import * as scheduleServices from '../services/scheduleServices.js';

export async function getAllStudent(req,res) {
    try {
        const result = await studentServices.getAllStudents();
        if(!result) return res.status(400).json({success:false,message:"Get student fail"});
        return res.status(200).json({success:true,result});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function  getAllClasses(req,res) {
    try {
        const classes = await classesServices.getAllClassesForAdmin();
        if(!classes) return res.status(400).json({success:false,message:'Get classes fail !!!'});
       return res.status(200).json({success:true,classes});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function getAllRoom(req,res) {
    try {
        const rooms = await roomServices.getAllRooms();
        return res.status(200).json({success:true,rooms});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function getAllTimeFrames(req,res) {
    try {
        const timeFrames = await timeFrameServices.getAllTimeFrames();
        if(!timeFrames) return res.status(400).json({success:false,message:'Get time frames fail !!!'});
        return res.status(200).json({success:true,timeFrames});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}


export async function getAllIntructors(req,res) {
    try {
        const instructorsWithDetails = await instructorServices.getAllIntructorsWithDetails();
        if(!instructorsWithDetails) return res.status(404).json({success:false,message:"Instructor is not existing!!!"});
        return res.status(200).json({success:true,instructorsWithDetails});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function getAllSubjects(req,res) {
    try {
        const subjects = await subjectServices.getAllSubjects();
        if(!subjects) return res.status(200).json({success:false,message:"Lỗi fetch data"});
        return res.status(200).json({success:true,subjects});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}


export async function getAllFaculties(req,res) {
    try {
        const faculties = await facultyServices.getAllFaculties();
        if(!faculties) return res.status(400).json({success:false,message:'Get the list of failed faculties'});
        return res.status(200).json({success:true,faculties});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

// async function getEarliesPhase(){
//     const snapshot = await db.collection("phases")
//     .orderBy("creatAt", "asc") // sắp xếp tăng dần → document đầu tiên là sớm nhất
//     .limit(1)
//     .get();
//     if(snapshot.empty) return null;
//     return {id:snapshot.docs[0].id,...snapshot.docs[0].data()}
// }

// Thêm instructor
export async function createInstructor(req,res) {
    try {
        const phase = await phaseServices.getEarliesPhase();
        const teachingAssignmentSnap = await teachingAssignmentServices.getOneTeachingAsssignments(req.body.classes,req.body.subjects,phase.id);
        if(!teachingAssignmentSnap) return res.status(409).json({success:false,message:'Instructor existed '});
        const isCreateIntructor = await instructorServices.createInstructor(req.body);
        if(!isCreateIntructor) return res.status(409).json({success:false,message:'Instructor existed '});   
        return res.status(201).json({success:true,message:'Instructor added successfully'});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function deleteInstructor(req,res) {
    try {
        const {id} = req.params;
        //if(!id) return res.status(400).json({success:false,message:"Id rỗng"});
        const isDeleteUser = await instructorServices.deleteInstructor(id);
        if(!isDeleteUser) return res.status(400).json({success:false,message:"Delete fail!"});
        return res.status(200).json({success:true,message:"Delete success!"});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}


export async function updateInstructor(req,res) {
    try {
        const {id} = req.params;
        const values = req.body;
        //if(!id || !values) return res.status(400).json({success:false,message:'Missing fields'});
        const isUpdateIntructor = await instructorServices.updateInstructor(id,values);
        if(!isUpdateIntructor) return res.status(404).json({success:false,message:"Intructor dont existence !"})
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
        const isDeleteClass = await classesServices.deleteOneClass(id);
        if(!isDeleteClass) return res.status(400).json({success:false,message:"Delete fail!"})
        return res.status(200).json({success:true,message:"Delete success!"})
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function creatClass(req,res) {
    try {
        const isCreateClass = await classesServices.createClass(req.body);
        if(!isCreateClass) return res.status(400).json({success:false,message:"Thêm thất bại"});
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
        const roomRef = await roomServices.updateRoomStatus(id,active);
        if(!roomRef) return res.status(400).json({success:false,message:"Update failed!"})
        return res.status(200).json({success:true,message:"Update success!"})
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function addRoom(req,res) {
    try {
        const values = req.body;
        //if(!values || Object.keys(values).length === 0) return res.status(400).json({success:false,message:"Dữ liệu rỗng"});
        const newRoom =  await roomServices.addRoom(values);
        return res.status(200).json({success:true,newRoom})
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function getSchedulesFromFaculties(req,res){
    try {
        const {facultyId} = req.params;
        //if(!facultyId) return res.status(400).json({success:false,message:"Dữ liệu rỗng"});
        const schedules = await scheduleServices.findScheduleOfInstructor(facultyId);
        return res.status(200).json({ success: true, schedules });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function getSchedulesWithCodeFacultyId(req,res) {
    try {
        const {code,facultyId} = req.query;
        const schedules = await scheduleServices.getSchedulesWithCodeFacultyId(facultyId,code);
        if(!schedules) return res.status(400).json({ success: false, message:"Lấy lịch thất bại!!!" });
        return res.status(200).json({ success: true, schedules });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function deleteSchedules(req,res) {
    try {
        const {id}=req.params;
        const {timeId,classId,subjectId} = req.query;
        const rawDayOfWeek = req.query.dayOfWeek;
        let dayOfWeek = [Number(rawDayOfWeek)];

        // if (Array.isArray(rawDayOfWeek)) {
        // dayOfWeek = rawDayOfWeek.map(Number);
        // } else if (typeof rawDayOfWeek === 'string') {
        // dayOfWeek = rawDayOfWeek.split(',').map(Number);
        // }

        //console.log({ id, classId, subjectId, timeId, dayOfWeek });
        if(isNaN(dayOfWeek[0])) return res.status(404).json({ success: false, message: "OMG" });
        const schedule = await scheduleServices.deleteSchedules(id,timeId,dayOfWeek,classId,subjectId);
        if(!schedule) return res.status(404).json({ success: false, message: "Schedule document not found" });
        // console.log(id);
        //const {classId, subjectId ,dayOfWeek} = req.body;
        // if(!id || !classId || !subjectId || !dayOfWeek) return res.status(400).json({ success: false, message: 'Field emtyp' }); 
        // const scheduleSnap =  await db.collection("schedules").doc(id).get();
        // if(!scheduleSnap.exists) return res.status(404).json({ success: false, message: "Schedule document not found" });
        // const scheduleData = scheduleSnap.data();

        // if (!Array.isArray(scheduleData.schedule)) {
        //     return res
        //         .status(400)
        //         .json({ success: false, message: "Dữ liệu schedules không hợp lệ" });
        // }

        //     const updatedSchedules = scheduleData.scheduleServices.map((item) => {
        //     if (
        //         item.classId === classId &&
        //         item.subjectId === subjectId &&
        //         item.dayOfWeek === dayOfWeek
        //     ) {
        //         return { ...item, active: false }; // cập nhật active
        //     }
        //     return item;
        //     });

        // await docRef.update({ schedules: updatedSchedules });

        return res.status(200).json({
        success: true,
        message: "Xóa thành công!!!",
        });

    } catch (error) {
        console.error("Lỗi khi cập nhật schedule:", error);
        return res.status(500).json({success:false,message:"Lỗi"});
            
    }
}


export async function addSchedule(req, res) {
  try {
    const values = req.body;
    //const allSchedulesSnap = await db.collection("schedules").get();
    let duplicateClassSubject = await scheduleServices.duplicateClassSubject();
    if (!duplicateClassSubject) {
      return res.status(400).json({
        success: false,
        message: "Lớp học này đã có giảng viên khác dạy môn này.",
      });
    }

    const isAddSchedule = await scheduleServices.addSchedule(values);
    if(!isAddSchedule){
        return res.status(400).json({
                success: false,
                message: "Bị trùng lịch dạy hoặc trùng phòng học trong khung giờ này.",
        });
    }

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
    const valuesForUI = await scheduleServices.updateSchedule(values,idS);
    if(!valuesForUI) return res.status(400).json({success:false,message:"Update that bai"});
    res.status(200).json({ success: true, valuesForUI });   
  } catch (error) {
        console.error("Lỗi khi cập nhật schedule:", error);
        return res.status(500).json({success:false,message:"Lỗi"});
  }
}

export async function getFacultiesForAdmin(req,res){
    try {
       const faculties = await facultyServices.getFacultiesForAdmin();
       if(!faculties) return res.status(400).json({success:false,message:"Thất bại"})
        return res.status(200).json({success:true,faculties});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function addFaculty(req,res) {
    try {
        const values = req.body;
        const isAddFaculty = await facultyServices.addFaculty(values);
        if(!isAddFaculty) return res.status(400).json({ success: false, message:"Thất bại" });
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

        const isUpdateFanculty = await facultyServices.updateFaculty(values,id);
        if(!isUpdateFanculty) return res.status(400).json({success:false,message:"Update faculty failed"})
        return res.status(200).json({
        success: true,
        //values: { id: updatedFacultySnap.id, ...updatedFacultySnap.data() },
        isUpdateFanculty
        });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function deleteFaculty(req,res) {
    try {
       const {id} = req.params;
       const facultySnap = await facultyServices.deleteFaculty(id);
       if(!facultySnap) return res.status(400).json({success:false,message:"Delete faculty failed"});
       return res.status(200).json({success:true,message:"Xóa khoa thành công"});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}


export async function addphases(req,res) {
    try {
        const values = req.body;
        const data = await phaseServices.addphases(values);
        if (!data) {
            return res.status(400).json({
                success: false,
                message: "Them that bai.",
            });
        }
        return res.status(201).json({
        success: true,
        message: "Tạo học kỳ thành công.",
        data,
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

// async function countInstructor(id) {
//     try {
//         //const subjectRef = await db.collection("subjects").doc(id).get();
//         const instructorSnap = await db.collection("users")
//         .where("role",'==',"instructor")
//         .where("deleted",'==',false)
//         .where("subjectId", "array-contains", id)
//         .get();

//         const instructorNumber = instructorSnap.size; 

//         return instructorNumber;
//     } catch (error) {
//         return null
//     }
// }

export async function getSubjectForAdmin(req,res) {
    try {
        const subjects = await subjectServices.getSubjectForAdmin();
        if(!subjects) return res.status(400).json({success:false,message:"Lấy danh sách môn học thất bại"});
        return res.status(200).json({success:true,subjects});
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}


export async function addSubject(req,res) {
    try {
        const subject = subjectServices.addSubject();
        return res.status(200).json({success:true,subject})
        
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function updateSubject(req,res) {
    try {
        const subject = await subjectServices.updateSubject(req.params.id,req.body)
        if(!subject) return res.status(404).json({success:false,message:"Subjects is not existsing"});
        return res.status(200).json({success:true,subject})
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}


export async function deleteSubject(req,res) {
    try {
        const isDelete = await subjectServices.deleteSubject(req.params);
        if(isDelete) return res.status(200).json({success:true,message:"Xóa thành công"});
        else{
            return res.status(200).json({success:false,message:"Môn học không tồn tại"});
        }
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false,message:"Lỗi"});
    }
}

export async function getListRoomChat(req,res) {
    try {
        const chatRooms = await roomServices.getListRoomChat();
        if(!chatRooms) return res.status(400).json({success:false,message:"Thất bại"});
        return res.status(200).json({success:true,chatRooms});
    } catch (error) {
        return res.status(500).json({success:false,message:"Lỗi tải room chat"})
    }

}
