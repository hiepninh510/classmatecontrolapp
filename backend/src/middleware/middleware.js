export async function check_Info_createInstructor(req,res,next) {
    try {
        const {name,phoneNumber,email,code,classes,subjects,faculty} = req.body;
        if(!name || !email || !code || !phoneNumber){
            return res.status(422).json({success:false,message:'Missing fields'})
        }
        next();
    } catch (error) {
        return res.status(500).json({success:false,message:'Lỗi'})
    }
}

export async function check_id(req,res,next) {
    const {id} = req.params;
    if(!id) return res.status(422).json({success:false,message:'Missing fields'})
    next(); 
}

export async function check_code(req,res,next) {
    const {code} = req.params;
    if(!code) return res.status(422).json({success:false,message:'Missing fields'});
    next();
} 

export async function check_values(req,res,next) {
    const values = req.body
    if(!values || Object.keys(values).length === 0) 
        return res.status(422).json({success:false,message: "Request body cannot be empty"});

    next();
}

export async function check_values_query(req,res,next) {
    const values = req.query;
    if(!values || Object.keys(values).length === 0) 
        return res.status(400).json({
            success:false,
            message: "Query params cannot be empty"
        });

    next();
}

export async function validate_code_facultyId(req,res,next) {
    const {code,facultyId} = req.query;
    if(!code || !facultyId) return res.status(400).json({success:false,message:'Missing fields'});
    next();
}

export async function validate_createInstructor(req,res,next) {
    const {name,phoneNumber,email,code,classes,subjects,faculty} = req.body; 
    if(!name || !phoneNumber || !email || !code || !classes || !subjects || !faculty)
        return res.status(400).json({success:false,message:'Missing fields'});
    next();
}