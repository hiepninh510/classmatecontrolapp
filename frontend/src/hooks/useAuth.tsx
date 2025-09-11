import { useNavigate } from "react-router-dom";
export const useAuthRole = () => {
      const navigate = useNavigate();
      
      const validateAccessCode = async (typeUser:string) =>{
        try {
            if(typeUser === "student"){
              sessionStorage.setItem("role",typeUser);
                navigate("/student/dashboard");
            }
            else{
              typeUser = "instructor";
              sessionStorage.setItem("role",typeUser);
                navigate("/instructor/dashboard")
            } ;
                
                
        } catch (error) {
            console.log(error);
            return false
        }

      }
        const isEmail = (value: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
        };

        const isPhoneNumber = (value: string): boolean => {
        const phoneRegex = /^(0\d{9}|(\+84)\d{9,10})$/;
        return phoneRegex.test(value);
        };
      return {validateAccessCode,isEmail,isPhoneNumber}
}