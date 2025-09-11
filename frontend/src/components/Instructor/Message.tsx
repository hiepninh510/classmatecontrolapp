import { useParams } from "react-router-dom"
import ChatApp from "./Chat"
export default function MessageWithStudent(){
    const {studentId} = useParams<{studentId?:string}>();
    console.log("studentid",studentId)
    return(
        <>
            <ChatApp chatTarget={studentId}/>
        </>
    )
}