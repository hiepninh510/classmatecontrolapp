import { createContext, useContext, useState, type ReactNode } from "react";

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

    const setAuth = (role: "student" | "instructor", userName: string) => {
    setRole(role);
    setUserName(userName);
  };

  const clearAuth = () => {
    setRole(null);
    setUserName(null);
  };

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

