import jwt from "jsonwebtoken";
// import fetch from "node-fetch";

import {db} from '../config/firebase.js';

export function validatePhoneNumber(req,res,next){
    try {
        
        if(req.body && req.body.phoneNumber){
            let phoneNumber = req.body.phoneNumber;
            if (phoneNumber.includes("@")) {
                return next();
            }
            if(!phoneNumber){
                return res.status(400).json({success:false,message:"Phone number is requied"});
            }
            phoneNumber = phoneNumber.replace(/\D/g,"");
            if(phoneNumber.startsWith("0")){
                phoneNumber = "+84"+phoneNumber.slice(1);
            }else if (!phoneNumber.startsWith("84")){
                phoneNumber = "84"+phoneNumber;
            }
            // phoneNumber="+"+phoneNumber;
            if(!phoneNumber.startsWith("+84")){
                return res.status(400).json({success:false,message:"Invalid phone number format"});
            }
            if(phoneNumber.length !==12){
                return res.status(400).json({success:false,message:"Invalid phone number lenght"})
            }
            req.body.phoneNumber = phoneNumber;
        }
        next();
    } catch (error) {
        return res.status(500).json({success:false,error:error.message});
    }
}

export function formatPhoneNumber(phone){
    if(!phone) return "";
    if(phone.startsWith("+84")){
        return "0"+phone.slice(3);
    }

    return phone;
}

export function normalPhoneNumber(phoneNumber){
    try {
        if(!phoneNumber){
            return null
        }
        phoneNumber = phoneNumber.replace(/\D/g,"");
        if(phoneNumber.startsWith("0")){
            phoneNumber = "+84"+phoneNumber.slice(1);
        }else if (!phoneNumber.startsWith("84")){
            phoneNumber = "84"+phoneNumber;
        }

        if(!phoneNumber.startsWith("+84")){
            return null
        }
        if(phoneNumber.length !==12){
            return null
        }
        return phoneNumber;

    } catch (error) {
        return res.status(500).json({success:false,error:error.message});
    }
}

export function generateAccessCode(){
    return Math.floor(100000+Math.random() * 900000).toString();
}

export function authenticate(req,res,next){
    try {
        // console.log("hello");
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(' ')[1];
        if(!token) return res.status(400).json({message:"Lỗi"})
        jwt.verify(token,process.env.JWT_SECRET,(error,user)=>{
            if(error) return res.status(403).json({message:"Token không hợp lệ!"});
            req.user = user;
            next();
        })
    } catch (error) {
        // return res.status(500).json({ message: error.message });
    }
}

export function authorize(allowedRoles) {
  return (req, res, next) => {
    // console.log(req.user.role)
    if (!allowedRoles.includes(req.user.role)) {
      return res.sendStatus(403).json({success:false,message:"Bạn không có quyền truy cập"}); // không có quyền
    }
    next();
  };
}

export async function verifyRecaptcha(req, res, next) {
     try {
        const token = req.body.recaptchaToken;
        if (!token) return res.status(400).json({ message: "Missing captcha token" });

        const secret = process.env.RECAPTCHA_SECRET_KEY; // từ .env
        if (!secret) return res.status(500).json({ message: "Server chưa cấu hình RECAPTCHA_SECRET_KEY" });

        const params = new URLSearchParams();
        params.append("secret", secret);
        params.append("response", token);

        const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params
        });
        const data = await response.json();
        if (!data.success) {
            return res.status(400).json({ message: "Captcha không hợp lệ", errors: data["error-codes"] });
        }

        next();
    } catch (error) {
        console.error("Lỗi verify reCAPTCHA:", error);
        return res.status(500).json({ message: "Error verifying captcha" });
    }
}


export async function convertCodeID(req,res,next) {
    try {
        const {code} = req.params;
        const instructorRef = await db.collection("users")
        .where("role",'==','instructor')
        .where("code","==",code)
        .limit(1)
        .get();

        if(instructorRef.empty) return res.status(200).json({success:false,message:"Không tìm thấy giảng viên"});
        req.params.id = instructorRef.docs[0].id;
        next();
    } catch (error) {
         return res.status(400).json({success:false,error});
    }
}

// middleware/convertEmailToPhoneNumber.js
export function convertEmailToPhoneNumber(req, res, next) {
  try {
    if (req.body?.email && !req.body?.phoneNumber) {
      req.body.phoneNumber = req.body.email;
      delete req.body.email; 
    }
    next();
  } catch (error) {
    console.error("convertEmailToPhoneNumber error:", error);
    return res.status(500).json({ success: false, message: "Lỗi middleware chuyển đổi dữ liệu" });
  }
}
