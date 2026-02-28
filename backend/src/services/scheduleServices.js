import {db} from '../config/firebase.js';
import * as facultyServices from '../services/facultyServices.js';
import * as classServices from '../services/classesServices.js';
import * as instructorServices from '../services/instructorServices.js';
import * as subjectServices from '../services/subjectServices.js';
import * as roomServices from '../services/roomServices.js';
import * as timeFrameServices from '../services/timeFramesServices.js'

export async function duplicateClassSubject() {
    try {
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
            return true
        }
        return false;

    } catch (error) {
        throw error;
    }
}

export async function  findScheduleWithInstructorID(instructorID) {
    try {
        const scheduleSnap = await db.collection("schedules").where("instructorId","==",instructorID).get();
        if(scheduleSnap.empty) return false;
        const schedules = scheduleSnap.docs.flatMap(doc =>
            (doc.data().schedule || []).map(sch => ({
                ...sch,
                id: doc.id
            }))
        );
        return schedules;
    } catch (error) {
        throw error;
    }
}

export async function findScheduleByID(id) {
    try {
        const scheduleSnap = await db.collection('schedules').doc(id).get();
        if(!scheduleSnap.exists) return false;
        const schedule = {id:scheduleSnap.id,...scheduleSnap.data()};
        return schedule;
    } catch (error) {
        throw error;
    }
}

export async function updateFieldOfSchedule(id,values) {
    try {
       const scheduleRef = db.collection("schedules").doc(id);
       console.log("values",values);
       await scheduleRef.update({
        schedule:values
       })
       return true;
    } catch (error) {
        throw error;
    }
}

export async function getOneScheduleByID(id,classId,subjectId,dayOfWeek) {
    try {
       const scheduleSnap =  await db.collection("schedules").doc(id).get();
        if(!scheduleSnap.exists) return false;
        const scheduleData = scheduleSnap.data();
        if (!Array.isArray(scheduleData.schedule)) {
            return false;
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

        return true;       
    } catch (error) {
        throw error;
    }
}

 export async function  findScheduleOfInstructor(arrayIDInstructor) {
    try {
        const schedulesSnap = await Promise.all(
            arrayIDInstructor.map(id=> db.collection("schedules").where("instructorId","in",id).get())
        );
        const schedulesDocs = schedulesSnap.flatMap(snap=>
            snap.docs.map(doc =>({id:doc.id,...doc.data()}))
        );
        return schedulesDocs;
    } catch (error) {
        throw error;
    }
 }

 export async function getSchedulesFromFaculties(facultyId) {
     try {
         const facultieRef = await facultyServices.findFacultyWithID(facultyId);
         if(!facultieRef) return false;
         const faculties = {id:facultyId,...facultieRef};
 
         const classes = await classServices.getClassWithFacultyID(facultyId);
         if(!classes) return false;
         const classIds = classes.map(c => c.id);

         const instructors = await instructorServices.filterInstructorWithClassID(classIds)
         if(!instructors) return false;
 
         const instructorId = instructors.map(item => item.id);
 
         const subjects = await subjectServices.getSubjectWithFacultyID(facultyId);
         
         if(!subjects) return false;
 
         let arrayIDInstructor = [];
         for(let i=0;i<instructorId.length;i+=10){
             arrayIDInstructor.push(instructorId.slice(i,i+10));
         }
 
         const schedulesDocs = await findScheduleOfInstructor(arrayIDInstructor);
 
         const rooms = await roomServices.getAllRooms();
         const times = await timeFrameServices.getAllTimeFrames();
 
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
             return schedules;       
     } catch (error) {
         throw error;
     }
 }

 export async function getSchedulesWithCodeFacultyId(facultyId,code) {
    try {
        const faculties = await facultyServices.findFacultyWithID(facultyId);

        const instructor = await instructorServices.findInstructorWithCode(code);

        const scheduleData = await findScheduleWithInstructorID(instructor.id);

        const classes = await classServices.getClassWithFacultyID(facultyId);
        
        const subjects = await subjectServices.getSubjectWithFacultyID(facultyId);

        const rooms = await roomServices.getAllRooms();

        const times = await timeFrameServices.getAllTimeFrames();

        if(!subjects && !classes && !rooms && !times && !instructor && !faculties && !scheduleData) return false;
    

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
        return schedules;
    } catch (error) {
        throw error;
    }
}

export async function deleteSchedules(id,timeId,dayOfWeek,classId,subjectId) {
    try {
        // console.log("id,timeId,dayOfWeek",id,timeId,dayOfWeek);
        // console.log("classId,subjectId",classId,subjectId);
        const schedule = await findScheduleByID(id);
        // console.log("schedule", schedule.schedule[0].dayOfWeek);
        if(!schedule) return false;
        let schedules = schedule.schedule.map(sch =>{
            if(sch.timeId === timeId 
                && sch.dayOfWeek.includes(dayOfWeek[0])
                && sch.classId === classId 
                && subjectId === sch.subjectId
            ) return {
                ...sch,active:false
            };
            return sch;
        });
        const updateSchedule = await updateFieldOfSchedule(id,schedules);
        //console.log("schedules", schedules);
        if(!updateSchedule) return false;
        return true; 
    } catch (error) {
        throw error;
    }
}

export async function addSchedule(values) {
    try {
        const schedules = await findScheduleWithInstructorID(values.instructorId);
        
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
        
            if (schedules !== null) {
              // Nếu giảng viên chưa có document → tạo mới với mảng scheduleItems
              await db.collection("schedules").add({
                instructorId: values.instructorId,
                type: "instructor",
                schedule: scheduleItems,
              });
              return true //res.status(200).json({ success: true, values });
            }
        
            //const docRef = schedulesSnap.docs[0].ref;
            //const scheduleData = schedulesSnap.docs[0].data().schedule;
            const scheduleData = schedules[0].schedule;
        
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
                return false
            //   return res.status(400).json({
            //     success: false,
            //     message: "Bị trùng lịch dạy hoặc trùng phòng học trong khung giờ này.",
            //   });
            }
        
            // Update: ghép mảng mới vào mảng cũ
            await docRef.update({
              schedule: [...scheduleData, ...scheduleItems],
            });
        
            return true;
            // res.status(200).json({ success: true, values });
    } catch (error) {
        throw error;
    }
}

export async function updateSchedule(values,idS) {
    try {
        const schedulesSnap = await db.collection("schedules").where("instructorId",'==',values.instructorId).get();
        if(schedulesSnap.empty){
            return false;
            // res.status(404).json({
            //     success: false,
            //      message: "Không tìm thấy lịch của giảng viên này.",
            // });          
        }
        const scheduleRef = schedulesSnap.docs[0].ref;
        const scheduleData = schedulesSnap.docs[0].data().schedule || [];
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
        } );
    };

    if (hasConflict(scheduleData, values, idS)) {
      return false
    }

    // Tìm index lịch cần update
    const indexScheduleUpdate = scheduleData.findIndex((s) => s.idS === idS);
    if (indexScheduleUpdate === -1) {
      return false
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
      return  false;
      //res.status(400).json({ success: false, message: err.message });
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

    return valuesForUI;
    } catch (error) {
        throw error
    }
}

export async function getMySchedules(id) {
    try {
        let scheduleSnap = await db.collection("schedules").where("instructorId",'==',id).get();
        if(scheduleSnap.empty) return {success:false,message:"Lịch chưa được khởi tạo"};
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
                    timeFrame:timeSnap.data().timeFrame,
                    id:scheduleSnap.docs[0].id
                }
            })
        )
        // console.log("scheduleData",scheduleData);
        return {success:true,scheduleData}
    } catch (error) {
        throw error
    }
}

export async function getMyShedulesOfStudent(id) {
    try {
        const studentRef = await db.collection("students").doc(id).get();
        if(!studentRef.exists) return {status:400,success:false,message:"studentRef don't exists"};
    
        const classRef = await db.collection("class").doc(studentRef.data().classId).get();
        if(!classRef.exists) return {status:400,success:false,message:"classRef don't exists"};
    
        const scheduleSnap = await db.collection("schedules").get();
        if(scheduleSnap.empty) return {status:400,success:false,message:"scheduleSnap don't exists"};


        const flattenSchedule = scheduleSnap.docs.flatMap(doc => 
            doc.data().schedule
                .filter((s) => s.classId === classRef.id)
                .map((s) => ({ ...s, id: doc.id }))
        );

        const schedules = await Promise.all(
            flattenSchedule.map(async (sch) => {
                const classSnap = await db.collection("class").doc(sch.classId).get();
                const roomSnap = await db.collection("rooms").doc(sch.roomId).get();
                const subjectSnap = await db.collection("subjects").doc(sch.subjectId).get();
                const timeSnap = await db.collection("times").doc(sch.timeId).get();

                if (!classSnap.exists || !roomSnap.exists || !subjectSnap.exists || !timeSnap.exists) return null;

                return {
                    ...sch,
                    className: classSnap.data()?.name,
                    roomName: roomSnap.data()?.name,
                    subjectName: subjectSnap.data()?.name,
                    timeFrame: timeSnap.data()?.timeFrame
                };
            })
        );

        const scheduleData = schedules.filter(Boolean);
        return {status:200,success:true,scheduleData};        
    } catch (error) {
        throw error
    }
}

