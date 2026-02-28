import {db} from '../config/firebase.js';
import * as classServices from './classesServices.js'
import * as instructorServices from './instructorServices.js'

export async function getAllFaculties() {
    try {
        const facultiesSnap = await db.collection("facultys").get();
        if(facultiesSnap.empty) return false;
        const facultys = facultiesSnap.docs.map(i => ({id:i.id,...i.data()}));
        return facultys;
    } catch (error) {
        throw error;
    }
}

export async function findFacultyWithID(id) {
    try {
       const facultySnap = await db.collection("facultys").doc(id).get(); 
       if(!facultySnap.exists) return false;
       return facultySnap.data();
    } catch (error) {
        throw error;
    }
}

export async function getFacultiesForAdmin(req,res){
    try {
        const facultiesSnap = await db.collection("facultys")
        .where("active",'==',true)
        .where("isDelete",'==',false)
        .get();

        if(facultiesSnap.empty) return false
        const facultiesData = facultiesSnap.docs.map(doc=>({id:doc.id,...doc.data()}));
        //const classSanp = await db.collection("class").where("isDelete","==",false).get();
        // const instructorSnap = await db.collection("users")
        // .where("deleted",'==',false)
        // .where("role","==","instructor")
        // .get();
        const classData = await classServices.getAllClasses();
        const instructorData = await instructorServices.getAllInstructor();
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
         return faculties;
    } catch (error) {
        throw error;
    }
}

export async function addFaculty(values) {
    try {
        await db.collection("facultys").add({...values,isDelete:false});
        return true;
    } catch (error) {
        throw error;
    }
}

// export async function updateFaculty(values,id) {
//     try {
//         const facultieRef = await db.collection("facultys").get();
//         const facultiesData = facultieRef.docs.map(doc => ({id:doc.id,...doc.data()}));
//         const isDeanId = facultiesData.filter(f => f.deanId === values.deanId);
//         if(isDeanId.length >0) return res.status(409).json({success:false,message:"Giảng viên này đã là trưởng khoa"});

//         const facultySnap = await db.collection("facultys").where("code",'==',id).get();
//         if (facultySnap.empty) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Không tìm thấy khoa có mã " + id,
//             });
//         }
//         const updateValues = {
//             ...values,
//             deanId: values.deanId === undefined ? null : values.deanId
//         }
//         const docRef = facultySnap.docs[0].ref;

//         await docRef.update(updateValues);

//         const updatedFacultySnap = await docRef.get();

//         return res.status(200).json({
//         success: true,
//         values: { id: updatedFacultySnap.id, ...updatedFacultySnap.data() },
//         });
//     } catch (error) {
//         console.log(error.message)
//         return res.status(500).json({success:false,message:"Lỗi"});
//     }
// }

export async function updateFaculty(values,id) {
    try {
        const facultySnap = await db.collection('facultys').where("code",'==',id).limit(1).get();
        if(facultySnap.empty) return false;
        const facultyRef = facultySnap.docs[0].ref;
        const facultyId = facultySnap.docs[0].id;
        if(values.deanId){
            const deanSnap = await db
                .collection("facultys")
                .where("deanId", "==", deanId)
                .get();

            const isDeanExists = deanSnap.docs.some(doc => doc.id !== facultyId);

            if (isDeanExists) {
                return false;
            }
        }
        const updateValues = {
            ...values,
            deanId: values.deanId === undefined ? null : values.deanId
        }
        await facultyRef.update(updateValues);
        const updatedFacultySnap = await docRef.get();
        return {
             id: updatedFacultySnap.id,
             ...updatedFacultySnap.data(),
        }
    } catch (error) {
        throw error
    }
}

export async function deleteFaculty(id) {
    try {
       const facultySnap = await db.collection("facultys").doc(id).get()
       if(!facultySnap.exists) return false;
       await facultySnap.ref.update({isDelete:true});
       return true;
    } catch (error) {
        throw error;
    }
}