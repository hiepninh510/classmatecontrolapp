
import ChatAppOfStudent from "./ChatAppOfStudent"
import { useParams } from "react-router-dom"
export default function MessageWithInstructor(){
    const {instructorId} = useParams<{instructorId?:string}>();
    return(
        <>
            <ChatAppOfStudent instructorId ={instructorId}/>
        </>
    )
}