import {db} from '../config/firebase.js'
import { normalPhoneNumber } from '../controller/formatController.js';

export async function openChatRoom(req, res) {
  try {
    let phoneNumber = req.body.phoneNumber;
    phoneNumber = normalPhoneNumber(phoneNumber);
    const userQuery = await db.collection("users")
      .where("phoneNumber", "==", phoneNumber)
      .get();
    const idUser = userQuery.docs[0].id;
    const snapshot = await db.collection("chats")
      .where("participants", "array-contains", idUser)
      .get();

    let chatRooms = [];
      chatRooms = await Promise.all(
        snapshot.docs.map(async (item) => {
          const data = item.data();
          const studentId = data.participants.find((p) => p !== idUser);
          let name = "";
          if (studentId) {
            const studentDoc = await db.collection("students").doc(studentId).get();
            if (studentDoc.exists) {
              name = studentDoc.data().name || ""; 
            }
          }
          return {
            id: item.id,
            ...data,
            studentId,
            name,
          };
        })
      );
      //  
    return res.status(200).json({ success: true, chatRooms,senderId: idUser});

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function openChatRoomOfStudent(req, res) {
  try {
    let phoneNumber = req.body.phoneNumber;
    phoneNumber = normalPhoneNumber(phoneNumber);
    const studentQuery = await db.collection("students")
      .where("phoneNumber", "==", phoneNumber)
      .get();
    if (studentQuery.empty) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const idStudent = studentQuery.docs[0].id;
    const snapshot = await db.collection("chats")
      .where("participants", "array-contains", idStudent)
      .get();

    let chatRooms = [];
    chatRooms = await Promise.all(
      snapshot.docs.map(async (item) => {
        const data = item.data();
        const instructorID = data.participants.find((p) => p !== idStudent);
  
          let name = "";
          if (instructorID) {
            const instructorDoc = await db.collection("users").doc(instructorID).get();
            if (instructorDoc.exists) {
              name = instructorDoc.data().name || "";
            }
          }
  
          return {
            id: item.id,
            ...data,
            instructorID,
            name,
          };
        })
      );
    // console.log(chatRooms);
    return res.status(200).json({ success: true, chatRooms,senderId:idStudent});

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function chatWithStudent(req, res) {
  try {
    const {phoneNumber,studentId} = req.body;
    if (!studentId) return res.status(400).json({ success: false, message: "Missing idStudent" });

    const normalizedPhone = normalPhoneNumber(phoneNumber);
    // console.log(normalizedPhone);
    const userQuery = await db.collection("users").where("phoneNumber", "==", normalizedPhone).get();
    if (userQuery.empty) return res.status(404).json({ success: false, message: "Teacher not found" });

    const idUser = userQuery.docs[0].id;
    const roleUser = userQuery.docs[0].data().role;

    // Lấy tất cả chat có teacher tham gia
    const snapshot = await db.collection("chats").where("participants", "array-contains", idUser).get();

    // Kiểm tra xem chat với studentId đã tồn tại chưa
    let chatRooms = await Promise.all(snapshot.docs.map(async (item) => {
      const data = item.data();
      let otherId = data.participants.find(p => p !== idUser);
      let name = "";

      if (roleUser !== 'student' && otherId) {
        const studentDoc = await db.collection("students").doc(otherId).get();
        if (studentDoc.exists) name = studentDoc.data().name || "";
        return { id: item.id, ...data, studentId: otherId, name };
      } else if (roleUser === 'student' && otherId) {
        const instructorDoc = await db.collection("users").doc(otherId).get();
        if (instructorDoc.exists) name = instructorDoc.data().name || "";
        return { id: item.id, ...data, instructorID: otherId, name };
      }
      return { id: item.id, ...data };
    }));

    const existingChat = chatRooms.find(c => c.studentId === studentId);
    if (!existingChat) {
      const studentDoc = await db.collection("students").doc(studentId).get();
      const name = studentDoc.exists ? studentDoc.data().name || "" : "";

      const newChatRoomRef = await db.collection("chats").add({
        participants: [idUser, studentId],
        createdAt: new Date(),
      });

      chatRooms.push({
        id: newChatRoomRef.id,
        participants: [idUser, studentId],
        studentId,
        name,
      });
    }

    return res.status(200).json({ success: true, chatRooms });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error });
  }
}

export async function getMessagesOfRoom(req,res) {
  try {
    // console.log("chat")
    let {idRoom,phoneNumber} = req.params;
    phoneNumber = normalPhoneNumber(phoneNumber);
    let query = await db.collection('students').where('phoneNumber','==',phoneNumber).get();
    if(query.empty){
      query = await db.collection('users').where('phoneNumber','==',phoneNumber).get();
      if(query.empty) return res.status(500).json({success:false,messages:"Số điện thoại bị lỗi"});
    }
    const senderId = query.docs[0].id;
    //console.log(senderId);
    const chatDoc = await db.collection("chats").doc(idRoom).get();
    const data = chatDoc.data();
    const messages = (data.messages || []).map((msg) => ({
      id: msg.id,
      senderId: msg.senderId,
      text: msg.text,
      createdAt: msg.createdAt?.toDate?.() // Firestore Timestamp → Date
        ? msg.createdAt.toDate().toISOString()
        : msg.createdAt || null,
    }));
    // console.log("gửi frontend",messages);
    return res.json({success:true,messages,senderId:senderId});
  } catch (err) {
    console.error("Lỗi khi lấy messages:", err);
    return [];
  }
}

