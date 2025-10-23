import { Router } from "express";
import * as FormatController from "../src/controller/formatController.js";
import * as AdminController from "../src/controller/AdminController.js";
import * as InstructorController from "../src/controller/InstructorController.js"
const router = Router();


//Get Admin
router.get('/getAllStudent',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.getAllStudent
);

router.get('/getAllSubject',
    FormatController.authenticate,
    FormatController.authorize(['admin']),
    AdminController.getAllSubjects
);

router.get('/getAllRoom',
    FormatController.authenticate,
    FormatController.authorize(['admin']),
    AdminController.getAllRoom
);
    
router.get('/getAllClass',
    FormatController.authenticate,
    FormatController.authorize(['admin']),
    AdminController.getAllClasses
);

router.get('/getAllInstructors',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.getAllIntructors
);

router.get('/getSchedulesFromFaculties/:facultyId',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.getSchedulesFromFaculties
);

router.get('/getAllTimeFrames',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.getAllTimeFrames
)

router.get('/getSchedulesWithCodeFacultyId',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.getSchedulesWithCodeFacultyId
);

router.get('/getAllFaculties',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.getAllFaculties
);

router.get('/getSchedule/:code',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    FormatController.convertCodeID,
    InstructorController.getMySchedules
);

router.get('/getSubjectForAdmin',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.getSubjectForAdmin
);

router.get('/faculties',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.getFacultiesForAdmin
)

router.get('/messages',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.getListRoomChat
)



//Post Admin
router.post('/createInstructor',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    FormatController.validatePhoneNumber,
    AdminController.createInstructor
);

router.post('/creatClass',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.creatClass
);

router.post('/creatRoom',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.addRoom
);

router.post('/addSchedule',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.addSchedule
);

router.post('/addFaculty',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.addFaculty
);

router.post('/addSubject',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.addSubject
);


//Put Admin
router.put('/updateInstructor/:id',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    FormatController.validatePhoneNumber,
    AdminController.updateInstructor
);

router.put('/updateRoomStatus/:id',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    FormatController.validatePhoneNumber,
    AdminController.updateRoomStatus
);

router.put('/updateSchedule/:idS',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.updateSchedule
);

router.put('/updateFaculty/:id',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.updateFaculty
);

router.put('/updateSubject/:id',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.updateSubject
)




//Delete Admin

router.delete('/deleteClass/:id',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.deleteOneClass
);

router.delete('/deleteInstructor/:id',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.deleteInstructor
);

router.delete('/deleteSchedules/:id',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.deleteSchedules
);

router.delete('/deleteFaculty/:id',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.deleteFaculty
);

router.delete('/deleteSubject',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.deleteSubject
);

export default router;