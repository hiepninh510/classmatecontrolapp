import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type AutheContextType = {
    role: 'student'|"instructor"|null;
    userName:string|null;
    setAuth:(role:"student"|"instructor", userName: string)=>void;
    clearAuth:()=>void;
}

const AuthContext = createContext<AutheContextType |undefined>(undefined);

export const AuthProvider = ({children}:{children:ReactNode})=>{
    const [role, setRole] = useState<"student" | "instructor"|null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [loading,setLoading] = useState(true);

    useEffect(()=>{
      const storeRole = localStorage.getItem("role") as "student" | "instructor" | null;
      const storeUserName = localStorage.getItem("userName");

      if(storeRole) setRole(storeRole);
      if(storeUserName) setUserName(storeUserName);

      setLoading(false);
    },[]);

    const setAuth = (role: "student" | "instructor", userName: string) => {
    setRole(role);
    setUserName(userName);

    localStorage.setItem("role", role);
    localStorage.setItem("userName", userName);
  };

  const clearAuth = () => {
    setRole(null);
    setUserName(null);

    localStorage.removeItem("role");
    localStorage.removeItem("userName");
  };

  if (loading) {
    // tránh UI nháy trắng trước khi load xong localStorage
    return <div>Loading...</div>;
  }


   return (
    <AuthContext.Provider value={{ role , userName, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth phải dùng trong AuthProvider");
  return context;
};

