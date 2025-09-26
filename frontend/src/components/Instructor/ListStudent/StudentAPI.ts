/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios"
const API = import.meta.env.VITE_BACKEND_URL;
export const studentAPI = {
    getAll: (id:string) =>  axios.get(`${API}/student/students/${id}`),
    add: (data: any) => axios.post(`${API}/student/addStudent`, data),
    update: (phone: string, data: any) => axios.put(`${API}/student/editStudent/${phone}`, data),
    delete: (phone: string) => axios.delete(`${API}/student/deleteStudent/${phone}`),
    assignLesson: (payload: any) => axios.post(`${API}/student/assignLesson`, payload),
    chats:(data:any) => axios.post(`${API}/chats`,data),
    getSubjects:(id:string) => axios.get(`${API}/instructor/getSubjects/${id}`),
    notification:(data:any) => axios.post(`${API}/notification`,data),
    getAllClass:(id:string) => axios.get(`${API}/instructor/getAllClass/${id}`),
    assignLessionForClass:(data:any) => axios.post(`${API}/instructor/assignLessionForClass`,data),
}



