// import { useParams } from "react-router-dom"
import { ChatRooms } from "../../components/ChatSocket/ChatRoom";
export default function MessageWithUser(){
    // const {studentId} = useParams<{studentId?:string}>();
    // console.log("studentid",studentId)
    return(
        <>
            <ChatRooms idUser={undefined}/>
        </>
    )
}