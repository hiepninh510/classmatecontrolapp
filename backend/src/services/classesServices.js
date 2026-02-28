import {db} from '../config/firebase.js';
import * as studentServices from './studentServices.js';
import * as facultyServices from './facultyServices.js';

export async function getAllClasses() {
    try {
        const classesSnap = await db.collection('class').where("isDelete",'==',false).get();
        if(classesSnap.empty) return false;
        const classes = classesSnap.docs.map(doc => ({id:doc.id,...doc.data()}));
        return classes
    } catch (error) {
        return error
    }
}

export async function getAllClassesForAdmin() {
    try { 
       const flapMapclasses = await getAllClasses();
       if(!flapMapclasses) return false;
       const classFillter = await Promise.all(
        flapMapclasses.map(async(item)=>{
            const studentCount = await studentServices.countStudentInClass(item.id);
            const facultyData = await facultyServices.findFacultyWithID(item.facultyId);
            if(studentCount && facultyData) {
                return {
                faculty:facultyData,
                classSize:studentCount,
                ...item
            }} else return null;
        }));
        const classes = classFillter.filter(Boolean);
       return classes;
    } catch (error) {
        throw error;
    }    
}

export async function deleteOneClass(id) {
    try {
        const classRef = await db.collection("class").doc(id).get();
        if(!classRef.exists) {
            return false;
        }
            await classRef.ref.update({
                isDelete:true
            })
        return true;        
    } catch (error) {
        throw error;
    }
}

export async function createClass(values) {
    try {
        const classesSnap = await db.collection("class").where("name",'==',values.name).get();
        if(!classesSnap.empty) return false;
        await db.collection("class").add({
            ...values,
            isDelete:false
        })
        return true;
    } catch (error) {
        throw error;
    }
}

export async function getClassWithFacultyID(facultyId) {
    try {
        const classSnap = await db.collection("class")
        .where("facultyId",'==',facultyId)
        .get();
        if(classSnap.empty) return false;
        const classes = classSnap.docs.map(cl=>({id:cl.id,...cl.data()}));
        return classes;      
    } catch (error) {
        throw error;
    }
}

export async function getAllClassForInstructor(id) {
    try {
        const userSnap = await db.collection('users').doc(id).get();
        if(!userSnap.exists) false;
        const classIds = userSnap.data().classId || [];
        const classs = await Promise.all(
            classIds.map(async (item)=>{
                const itemSnap = await db.collection("class").doc(item).get();
                if(itemSnap.exists) return {id:itemSnap.id,...itemSnap.data()};
                else return null
            })
        )
        const dataClass = classs.filter(Boolean);
        return dataClass;
    } catch (error) {
        throw error;
    }    
}

export async function assignLessionForClass(instructorId,subjectId,classId,description) {
    try {
        const studentSnap = await db.collection("students").where("classId",'==',classId).get();
        if(studentSnap.empty) {
            return false;
        }
        const batch = db.batch();
        studentSnap.forEach((item)=>{
            const lessonId = `lesson_${Date.now()}_${uuidv4()}`;
            const newLession = {
                id:lessonId,
                createAt: new Date(),
                done:false,
                description,
                instructorId,
                subjectId
            }
            const studentRef = db.collection("students").doc(item.id);
            batch.update(studentRef,{
                lessions:admin.firestore.FieldValue.arrayUnion(newLession),
            });
        });
        await batch.commit();
        return true;
    } catch (error) {
        throw error;
    }
}