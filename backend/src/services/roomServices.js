import {db} from '../config/firebase.js';

export async function getAllRooms() {
    try {
        const roomRef = await db.collection("rooms").get();
        if(roomRef.empty) return false;
        const rooms = roomRef.docs.map(doc=>({id:doc.id,...doc.data()}));
        return rooms;
    } catch (error) {
     throw error;   
    }
}

export async function getListRoomChat() {
    try {
        const adminSnap = await db.collection("users").where("role","==","admin").get();
        if(adminSnap.empty) return false;
        const chatsAdmin = await db.collection("chats")
        .where("participants","array-contains",adminSnap.docs[0].id)
        .get();

        const userRef= await db.collection("users").get();
        const userData = userRef.docs.map(doc => ({id:doc.id,...doc.data()}));

        if(chatsAdmin.empty) return false;

        const chatRoomsData = chatsAdmin.docs.map(doc =>({id:doc.id,...doc.data()}));
        const chatRooms = chatRoomsData.map(chR =>{
            const userNeedFind = userData.find(usD =>{
                return chR.participants.includes(usD.id);
            })
            return {
                ...chR,
                name:userNeedFind.name,             
            }
        })
        return chatRooms;
    } catch (error) {
        throw error;
    }
}

export async function  updateRoomStatus(id,active) {
    try {
        const roomRef = await db.collection("rooms").doc(id).get();
        if(!roomRef.exists) return false;
        roomRef.ref.update({
            active
        })
        return true;    
    } catch (error) {
        throw error;
    }
}

export async function addRoom(values) {
    try {
        const docRef = await db.collection('rooms').add({
            ...values
        })
        const newRoomSnap = await docRef.get();
        const newRoom = { id: docRef.id, ...newRoomSnap.data() };
        return newRoom;
    } catch (error) {
        throw error;
    }
}