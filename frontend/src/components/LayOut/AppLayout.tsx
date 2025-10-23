import { useAuth } from "../../hooks/ThemeContext";
import { AppHeader } from "./AppHeader";
import { AppFooter } from "./AppFooter";
import { AppContent } from "./AppContent";
import { Outlet } from "react-router-dom";
import { ChatWidget } from "../ChatSocket/ChatWeget";

export default function AppLayout(){
    const {role,userName} = useAuth();

    if(!role || !userName) return null;
     return (
     <>
        <AppHeader 
            role={role!}
            userName={userName!}/>
        <AppContent><Outlet/></AppContent>
            {role !== "admin" && <ChatWidget />}
        <AppFooter/>
     </>
     )
}