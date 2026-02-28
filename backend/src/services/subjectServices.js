import { db } from "../config/firebase.js";
import * as instructorServices from './instructorServices.js';

export async function getAllSubjects() {
    try {
        const subjectSnap = await db.collection("subjects").get();
        if(subjectSnap.empty)  return false;
        const subjects = subjectSnap.docs.map(sb=>({id:sb.id,...sb.data()}));
        return subjects;
    } catch (error) {
        //console.log(error.message)
        throw error;
    }
}

export async function addSubject(values) {
    try {
        const data = {
            ...values,
            isDelete:false,
            active:true
        }
    await db.collection("subjects").add(data);
    const subject = {...data,instructorNumber:0};
    return subject;
        
    } catch (error) {
        throw error;
    }

}

export async function updateSubject(id,values) {
    try {
        const subjectRef = db.collection("subjects").doc(id);
        const subjectData = await db.collection("subjects").doc(id).get();
        if(!subjectData.exists) return false;
        await subjectData.ref.update(values)
        const updatedSnap = await subjectRef.get();
        const instructorNumber = await instructorServices.countInstructor(id);
        const subject = {
            id:updatedSnap.id,
            ...updatedSnap.data(),
            instructorNumber
        }
        return subject;    
        
    } catch (error) {
        throw error;
    }
}

export async function deleteSubject(id) {
    try {
        const subjectSnap = await db.collection("subjects").doc(id).get();
        if(!subjectSnap.exists) return false;
        await subjectSnap.ref.update({isDelete:true});       
        return true;
    } catch (error) {
        throw error;
    }
}

export async function getSubjectWithFacultyID(facultyID) {
    try {
        const subjectSnap = await db.collection("subjects").where("facultyId","==",facultyID).get();
        if(subjectSnap.empty) return false;
        const subjects = subjectSnap.docs.map(doc=>({id:doc.id,...doc.data()}));
        return subjects;
    } catch (error) {
        throw error;
    }
}

export async function getSubjectForAdmin(params) {
    try {
        const subjectSnap = await db.collection("subjects").where("isDelete",'==',false).get();
        if(subjectSnap.empty) return false;
        const subjectData = subjectSnap.docs.map(doc=>({id:doc.id,...doc.data()}));
        const instructorSnap = await db.collection("users")
        .where("role",'==','instructor')
        .where("deleted",'==',false)
        .get();
        const instructorData = instructorSnap.docs.map(doc => ({id:doc.id,...doc.data()}));
        const subjects = subjectData.map(sb => ({
            ...sb,
            instructorNumber: instructorData.filter(
                ins => Array.isArray(ins.subjectId) && ins.subjectId.includes(sb.id)
            ).length
        }));
        return subjects;
    } catch (error) {
        throw error;
    }
}

export async function getSubjectsOfInstructor(id) {
    try {
        const userSnap = await db.collection('users').doc(id).get();
        if(!userSnap.exists) return false;
        const subjectIs = userSnap.data().subjectId || [];
        const subjects = await Promise.all(
            subjectIs.map(async (item)=>{
                const itemSap = await db.collection("subjects").doc(item).get();
                if(itemSap.exists) return {id:itemSap.id,...itemSap.data()};
                else return null;
            })
        )

        const dataSubjects = subjects.filter(Boolean);
        return dataSubjects;
    } catch (error) {
        throw error;
    }    
}

export async function getAssignedSubject(id) {
    try {
        const instructorSnap = await db.collection("users").doc(id).get();
        if(!instructorSnap.exists) return false;

        const assignmentSnap = await db.collection('assignments')
        .where('classId','in',instructorSnap.data().classId)
        .where('instructorId','==',instructorSnap.id)
        .get()

        if(assignmentSnap.empty) return false;

        const assignmentData = assignmentSnap.docs.map(doc => ({id:doc.id,...doc.data()}));
        let subjectSnap = await Promise.all(
                assignmentData.map(async(item)=>{
                    const itemSnap = await db.collection("subjects").doc(item.subjectId).get();
                    if(itemSnap.exists) return {id:itemSnap.id,...itemSnap.data()};
                    else return null;
                })
            );

            const dataSubjects = subjectSnap.filter(Boolean);
            return dataSubjects;
    } catch (error) {
        throw error;
    }   
}