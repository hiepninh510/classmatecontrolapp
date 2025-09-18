import { useParams } from "react-router-dom"
import { ChatRooms } from "../ChatSocket/ChatRoom";
export default function MessageWithStudent(){
    const {studentId} = useParams<{studentId?:string}>();
    // console.log("studentid",studentId)
    return(
        <>
            <ChatRooms idUser={studentId}/>
        </>
    )
}