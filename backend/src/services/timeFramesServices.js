import {db} from '../config/firebase.js';

export async function getAllTimeFrames() {
    try {
        const timeFrameSnap = await db.collection("times").get();
        if(timeFrameSnap.empty) return false;
        const timeFrames = timeFrameSnap.docs.map(doc =>({id:doc.id,...doc.data()}))
        return timeFrames;        
    } catch (error) {
        throw error;
    }
}
