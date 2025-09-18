
import { ChatRooms } from "../ChatSocket/ChatRoom";
import { useParams } from "react-router-dom"
export default function MessageWithInstructor(){
    const {instructorId} = useParams<{instructorId?:string}>();
    return(
        <>
            <ChatRooms idUser ={instructorId}/>
        </>
    )
}