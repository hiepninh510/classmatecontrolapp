/* eslint-disable @typescript-eslint/no-explicit-any */
import axois from "../api/api"
const API = import.meta.env.VITE_BACKEND_URL;


export const adminAPI = {
    getAllStudent:()=> axois.get(`${API}/admin/students`),
    getAllInstructors:()=> axois.get(`${API}/admin/instructors`),
    getAllSubject:()=> axois.get(`${API}/admin/subjects`),
    getAllClass:()=> axois.get(`${API}/admin/all-classes`),
    getAllRoom:() => axois.get(`${API}/admin/rooms`),
    getAllTimeFrames:() => axois.get(`${API}/admin/timeframes`),
    getAllFaculties:()=> axois.get(`${API}/admin/faculties`),
    getSchedule:(code:string) => axois.get(`${API}/admin/schedule/${code}`),
    getScheduleWithFacultyId:(facultyId:string) => axois.get(`${API}/admin/schedules-from-faculties/${facultyId}`),
    getScheduleWitCodeFacultyId:(code:string,facultyId:string) => axois.get(`${API}/admin/schedules-with-code-faculty-id`,{
        params:{
            code,
            facultyId
        }
    }),

    getFacultiesForAdmin:()=>axois.get(`${API}/admin/faculties`),
    getSubjectForAdmin:()=>axois.get(`${API}/admin/subject-for-admin`),

    updateInstructor:(id:string,data:any) => axois.put(`${API}/admin/instructor/${id}`,data),
    updateRoomStatus:(id:string,active:boolean|undefined)=> axois.put(`${API}/admin/room-status/${id}`,{active}),
    updateSchedule:(idS:string,data:any)=>axois.put(`${API}/admin/schedule/${idS}`,data),
    updateFaculty:(id:string,data:any)=>axois.put(`${API}/admin/faculty/${id}`,data),
    updateSubject:(id:string,data:any)=> axois.put(`${API}/admin/subject/${id}`,data),

    addInstructor:(data:any) => axois.post(`${API}/admin/instructor`,data),
    addClass:(data:any)=>axois.post(`${API}/admin/class`,data),
    addRoom:(data:any) => axois.post(`${API}/admin/room`,data),
    addSchedule:(data:any) => axois.post(`${API}/admin/schedule`,data),
    addFaculty:(data:any) => axois.post(`${API}/admin/faculty`,data),
    addSubject:(data:any) => axois.post(`${API}/admin/subject`,data),


    deleteInstructor:(id:string) => axois.delete(`${API}/admin/instructor/${id}`),
    deleteClass:(id:string) => axois.delete(`${API}/admin/class/${id}`),
    deleteSchedule:(id:string,data:any) => axois.delete(`${API}/admin/schedules/${id}`,{
        params:{
            classId:data.classId,
            subjectId:data.subjectId,
            timeId:data.timeId,
            dayOfWeek:data.dayOfWeek,
        }
    }),
    deleteFaculty:(id:string) => axois.delete(`${API}/admin/faculty/${id}`),
    deleteSubject:(id:string) => axois.delete(`${API}/admin/subject/${id}`),



}

