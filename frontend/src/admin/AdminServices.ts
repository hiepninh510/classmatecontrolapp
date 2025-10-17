/* eslint-disable @typescript-eslint/no-explicit-any */
import axois from "../api/api"
const API = import.meta.env.VITE_BACKEND_URL;


export const adminAPI = {
    getAllStudent:()=> axois.get(`${API}/admin/getAllStudent`),
    getAllInstructors:()=> axois.get(`${API}/admin/getAllInstructors`),
    getAllSubject:()=> axois.get(`${API}/admin/getAllSubject`),
    getAllClass:()=> axois.get(`${API}/admin/getAllClass`),
    getAllRoom:() => axois.get(`${API}/admin/getAllRoom`),
    getAllTimeFrames:() => axois.get(`${API}/admin/getAllTimeFrames`),
    getAllFaculties:()=> axois.get(`${API}/admin/getAllFaculties`),
    getSchedule:(code:string) => axois.get(`${API}/admin/getSchedule/${code}`),
    getScheduleWithFacultyId:(facultyId:string) => axois.get(`${API}/admin/getSchedulesFromFaculties/${facultyId}`),
    getScheduleWitCodeFacultyId:(code:string,facultyId:string) => axois.get(`${API}/admin/getSchedulesWithCodeFacultyId`,{
        params:{
            code,
            facultyId
        }
    }),

    getFacultiesForAdmin:()=>axois.get(`${API}/admin/faculties`),

    updateInstructor:(id:string,data:any) => axois.put(`${API}/admin/updateInstructor/${id}`,data),
    updateRoomStatus:(id:string,active:boolean|undefined)=> axois.put(`${API}/admin/updateRoomStatus/${id}`,{active}),
    updateSchedule:(idS:string,data:any)=>axois.put(`${API}/admin/updateSchedule/${idS}`,data),
    updateFaculty:(id:string,data:any)=>axois.put(`${API}/admin/updateFaculty/${id}`,data),

    addInstructor:(data:any) => axois.post(`${API}/admin/createInstructor`,data),
    addClass:(data:any)=>axois.post(`${API}/admin/creatClass`,data),
    addRoom:(data:any) => axois.post(`${API}/admin/creatRoom`,data),
    addSchedule:(data:any) => axois.post(`${API}/admin/addSchedule`,data),
    addFaculty:(data:any) => axois.post(`${API}/admin/addFaculty`,data),


    deleteInstructor:(id:string) => axois.delete(`${API}/admin/deleteInstructor/${id}`),
    deleteClass:(id:string) => axois.delete(`${API}/admin/deleteClass/${id}`),
    deleteSchedule:(id:string,data:any) => axois.delete(`${API}/admin/deleteSchedules/${id}`,data),
    deleteFaculty:(id:string) => axois.delete(`${API}/admin/deleteFaculty/${id}`),


}

