import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type AutheContextType = {
    id:string | null,
    role: 'student'|"instructor"|"admin"|null;
    userName:string|null;
    setAuth:(role:"student"|"instructor", userName: string, id:string)=>void;
    clearAuth:()=>void;
}

const AuthContext = createContext<AutheContextType |undefined>(undefined);

export const AuthProvider = ({children}:{children:ReactNode})=>{
    const [role, setRole] = useState<"student" | "instructor"|"admin"|null>(null);
    const [id,setId] = useState<string|null>(null)
    const [userName, setUserName] = useState<string | null>(null);
    const [loading,setLoading] = useState(true);

    useEffect(()=>{
      const storeRole = localStorage.getItem("role") as "student" | "instructor" | null;
      const storeUserName = localStorage.getItem("userName");
      const storeId = localStorage.getItem("id");

      if(storeRole) setRole(storeRole);
      if(storeUserName) setUserName(storeUserName);
      if(storeId) setId(storeId);

      setLoading(false);
    },[]);

    const setAuth = (role: "student" | "instructor" | "admin", userName: string, id:string) => {
      setRole(role);
      setUserName(userName);
      setId(id);

      localStorage.setItem("id",id)
      localStorage.setItem("role", role);
      localStorage.setItem("userName", userName);
  };

  const clearAuth = () => {
    setRole(null);
    setUserName(null);
    setId(null);
    localStorage.removeItem("id");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
  };

  if (loading) {
    // tránh UI nháy trắng trước khi load xong localStorage
    return <div>Loading...</div>;
  }


   return (
    <AuthContext.Provider value={{ role , userName, id, setAuth, clearAuth }}>
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

