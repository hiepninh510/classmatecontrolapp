export function validatePhoneNumber(req,res,next){
    try {
        //console.log(req.body)
        if(req.body && req.body.phoneNumber){
            let phoneNumber = req.body.phoneNumber;
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