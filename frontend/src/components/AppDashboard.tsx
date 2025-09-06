import { Layout } from "antd";
import { AppHeader } from "./AppHeader";
import { AppFooter } from "./AppFooter";
import ListStudent from "./Instructor/ListStudent";
import MessageWithStudent from "./Instructor/Message";
import ListLession from "./Student/ListLession";
import MessageWithInstructor from "./Student/Message";
import ProfilePage from "./Student/Profile";
import { useState } from "react";
import { AppContent } from "./AppContent";
import { useAuth } from "../hooks/ThemeContext";

// type DashboardProps = {
//   role: "student" | "instructor";
//   userName:string
// };

export function AppDashBoard(){
    const [selectKey,setSelectKey] = useState('1');
    const {role, userName} = useAuth();
     const [chatTarget, setChatTarget] = useState<string | null>(null);

    if (!role || !userName) {
        return null; // hoặc UI loading
    }

    const handleOpenChat = (studentId:string)=>{
        setChatTarget(studentId);
        setSelectKey("2");
    }

    const renderContext = ()=>{
        if(role ==='student'){
            switch(selectKey){
                case "1":
                    return (<><ListLession/></>)
                case "2":
                    return(<><MessageWithInstructor/></>)
                case "3":
                    return(<><ProfilePage/></>)
                }
        }
        if(role ==='instructor'){
            switch(selectKey){
                case "1":
                    return (<><ListStudent openChat={handleOpenChat} /></>)
                case '2':
                    return (<><MessageWithStudent chatTarget={chatTarget}/></>)
            }
        }
    }


    return(
        <>
        <Layout>
            <AppHeader role={role} userName={userName} selectKey = {selectKey} onSelectKey ={setSelectKey} />
            <AppContent children={renderContext()}/>
            <AppFooter/>
        </Layout>
        </>
    )
}