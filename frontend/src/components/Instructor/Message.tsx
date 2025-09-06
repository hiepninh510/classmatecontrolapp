import ChatApp from "./Chat"
export default function MessageWithStudent({ chatTarget }: { chatTarget?: string | null }){
    return(
        <>
            <ChatApp chatTarget={chatTarget}/>
        </>
    )
}