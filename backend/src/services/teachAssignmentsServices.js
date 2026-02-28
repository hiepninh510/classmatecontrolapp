import { db } from "../config/firebase.js";

export async function getOneTeachingAsssignments(classId,subjectId,phaseId) {
    try {
        const teachingAssignmentSnap = await db.collection("teachingAssignments")
        .where('classId',"in",classId)
        .where("subjectId","in",subjectId)
        .where("phaseId",'==',phaseId)
        .get()
        if(!teachingAssignmentSnap.empty) return false;
        return true;      
    } catch (error) {
        return error
    }
}