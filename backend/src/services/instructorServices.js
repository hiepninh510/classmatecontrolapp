import { db } from "../config/firebase.js";
import {formatPhoneNumber} from '../middleware/formatController.js'
import { normalPhoneNumber } from '../middleware/formatController.js';

export async function countInstructor(id) {
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

export async function getAllInstructor() {
    try {
        const instructorSnap = await db.collection('users')
            .where("role",'==','instructor')
            .where("deleted","==",false)
            .get();

        if(instructorSnap.empty) return false;
        const instructors = instructorSnap.docs.map(i => ({id:i.id,...i.data()}));
        return instructors;
    } catch (error) {
        throw error;
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

async function getSubjectsOfInstructorListByInstructorId(listID) {
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

export async function getAllIntructorsWithDetails() {
    try {
        const instructors = await getAllInstructor();
        if(!instructors) return false;
        const instructorsWithDetails = await Promise.all(
        instructors.map(async (ins) => {
            const classes = await getClassesListByInstructorId(ins.classId || []);
            const subjects = await getSubjectsOfInstructorListByInstructorId(ins.subjectId || []);
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
        return instructorsWithDetails;
    } catch (error) {
        throw error;   
    }
}

export async function createInstructor(body) {
    try {
        const {name,phoneNumber,email,code,classes,subjects,faculty} = body;  
        const isUserExisting = await db.collection('users')
        .where('phoneNumber','==',phoneNumber)
        .where('email','==',email)
        .where("code","==",code)
        .get();

        if(!isUserExisting.empty){
            return false;
        }
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
        return true;              
    } catch (error) {
        throw error;
    }
}

export async function deleteInstructor(id) {
    try {
        const userRef = await db.collection("users").doc(id).get();
        if(!userRef.exists) return false;
        await userRef.ref.update({
            deleted:true
        })
        return true;
    } catch (error) {
        throw error;
    }
}

export async function updateInstructor(id,values) {
    try {
        const instructorRef = await db.collection("users").doc(id).get();
        if(!instructorRef.exists)  return false;

        const { classes, subjects, ...rest } = values;
        await instructorRef.ref.update({
            ...rest,
            classId:classes,
            subjectId:subjects
        });
        return true;
    } catch (error) {
       throw error; 
    }
}

export async function filterInstructorWithClassID(classIds) {
    try {
        let instructors = await getAllInstructor();
        instructors.filter((ins)=>
            Array.isArray(ins.classId) && ins.classId.some((cid)=> classIds.includes((cid)))
        )
        // const instructorSnap = await db
        //     .collection("users")
        //     .where("deleted", "==", false)
        //     .where("role", "==", "instructor")
        //     .get();
        // if(instructorSnap.empty) return false;
        // const instructors = instructorSnap.docs
        // .map((doc) => ({id:doc.id,...doc.data()}))
        // .filter((ins)=>
        //     Array.isArray(ins.classId) && ins.classId.some((cid)=> classIds.includes((cid)))
        // )
        return instructors;

    } catch (error) {
        throw error;
    }
}

export async function findInstructorWithCode(code) {
    try {
        const instructorSnap = await db.collection("users").where("code","==",code).get();
        if(instructorSnap.empty) return false;
        const instructor = {id:instructorSnap.docs[0].id,...instructorSnap.docs[0].data()};
        return instructor;
    } catch (error) {
        throw error;
    }
}

export async function  findIdInstructor(phoneNumbers) {
    try {
        const phoneNumber = normalPhoneNumber(phoneNumbers);
        const instructorQurey = await db.collection('users').where('phoneNumber','==',phoneNumber).get();
        if(instructorQurey.empty) return false;
        const idInstructor = instructorQurey.docs[0].id;
        return idInstructor;
    } catch (error) {
        throw error;
    }   
}