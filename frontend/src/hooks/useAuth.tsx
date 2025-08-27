import { useNavigate } from "react-router-dom";
export const useAuth = () => {
      const navigate = useNavigate();
      
      const validateAccessCode = async (typeUser:string) =>{
        try {
            if(typeUser === "student"){
                navigate("/student/dashboard");
            }
            else{
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
        // Regex cho số điện thoại VN: bắt đầu bằng 0 hoặc +84, sau đó là 9-10 chữ số
        const phoneRegex = /^(0\d{9}|(\+84)\d{9,10})$/;
        return phoneRegex.test(value);
        };
      return {validateAccessCode,isEmail,isPhoneNumber}
}