import { Router } from "express";
import * as FormatController from "../src/middleware/formatController.js";
import * as AdminController from "../src/controller/AdminController.js";
import * as InstructorController from "../src/controller/InstructorController.js"
import * as Middleware from "../src/middleware/middleware.js"
const router = Router();


//Get Admin
router.get('/students',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.getAllStudent
);

router.get('/subjects',
    FormatController.authenticate,
    FormatController.authorize(['admin']),
    AdminController.getAllSubjects
);

router.get('/rooms',
    FormatController.authenticate,
    FormatController.authorize(['admin']),
    AdminController.getAllRoom
);
    
router.get('/all-classes',
    FormatController.authenticate,
    FormatController.authorize(['admin']),
    AdminController.getAllClasses
);

router.get('/instructors',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.getAllIntructors
);

router.get('/schedules-from-faculties/:facultyId',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    Middleware.check_id(),
    AdminController.getSchedulesFromFaculties
);

router.get('/timeframes',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.getAllTimeFrames
)

router.get('/schedules-with-code-faculty-id',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    Middleware.check_values_query(),
    Middleware.validate_code_facultyId(),
    AdminController.getSchedulesWithCodeFacultyId
);

router.get('/faculties',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.getAllFaculties
);

router.get('/schedule/:code',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    FormatController.convertCodeID,
    InstructorController.getMySchedules
);

router.get('/subject-for-admin',
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
router.post('/instructor',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    Middleware.check_values(),
    Middleware.validate_createInstructor(),
    FormatController.validatePhoneNumber,
    AdminController.createInstructor
);

router.post('/class',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    Middleware.check_values(),
    AdminController.creatClass
);

router.post('/room',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    Middleware.check_values(),
    AdminController.addRoom
);

router.post('/schedule',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    Middleware.check_values(),
    AdminController.addSchedule
);

router.post('/faculty',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    Middleware.check_values(),
    AdminController.addFaculty
);

router.post('/subject',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.addSubject
);


//Put Admin
router.put('/instructor/:id',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    FormatController.validatePhoneNumber,
    AdminController.updateInstructor
);

router.put('/room-status/:id',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    FormatController.validatePhoneNumber,
    AdminController.updateRoomStatus
);

router.put('/schedule/:idS',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.updateSchedule
);

router.put('/faculty/:id',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.updateFaculty
);

router.put('/subject/:id',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.updateSubject
)




//Delete Admin

router.delete('/class/:id',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.deleteOneClass
);

router.delete('/instructor/:id',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    Middleware.check_id(),
    AdminController.deleteInstructor
);

router.delete('/schedules/:id',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    Middleware.check_id(),
    Middleware.check_values_query(),
    AdminController.deleteSchedules
);

router.delete('/faculty/:id',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    Middleware.check_id(),
    AdminController.deleteFaculty
);

router.delete('/subject/:id',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    Middleware.check_id(),
    AdminController.deleteSubject
);

export default router;