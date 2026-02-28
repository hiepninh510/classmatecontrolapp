import { db } from "../config/firebase.js";

export async function getEarliesPhase(){
    const snapshot = await db.collection("phases")
    .orderBy("creatAt", "asc") // sắp xếp tăng dần → document đầu tiên là sớm nhất
    .limit(1)
    .get();
    if(snapshot.empty) return null;
    return {id:snapshot.docs[0].id,...snapshot.docs[0].data()}
}

export async function addphases(values) {
    try {
        const existingPhaseSnap = await db.collection("phases").where("name", "==", values.name).get();
        if (!existingPhaseSnap.empty) { 
            return false;
        }
         const docRef = await db.collection("phases").add({
            ...values,
            createdAt: new Date(),
        });

        const newDoc = await docRef.get();

        return { id: newDoc.id, ...newDoc.data() }
    } catch (error) {
        throw error;
    }
}