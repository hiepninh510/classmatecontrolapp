import { Router } from "express";
import * as FormatController from "../src/controller/formatController.js";
import * as AdminController from "../src/controller/AdminController.js";
import * as InstructorController from "../src/controller/InstructorController.js"
const router = Router();

router.get('/getAllStudent',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.getAllStudent
    );

router.get('/getAllSubject',
    FormatController.authenticate,
    FormatController.authorize(['admin']),
    AdminController.getAllSubjects);

router.get('/getAllRoom',
    FormatController.authenticate,
    FormatController.authorize(['admin']),
    AdminController.getAllRoom);
    
router.get('/getAllClass',
    FormatController.authenticate,
    FormatController.authorize(['admin']),
    AdminController.getAllClasses);

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

router.get('/getSchedulesWithCodeFacultyId',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.getSchedulesWithCodeFacultyId
);

router.post('/createInstructor',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    FormatController.validatePhoneNumber,
    AdminController.createInstructor);

router.get('/getAllFaculties',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.getAllFaculties
);

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

router.get('/getSchedule/:code',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    FormatController.convertCodeID,
    InstructorController.getMySchedules
)

router.get('/getAllTimeFrames',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.getAllTimeFrames
)

router.post('/addSchedule',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.addSchedule
)

router.put('/updateSchedule/:idS',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.updateSchedule
);

router.get('/faculties',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.getFacultiesForAdmin
)

router.post('/addFaculty',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.addFaculty
)

router.put('/updateFaculty/:id',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.updateFaculty
);

router.delete('/deleteFaculty/:id',
    FormatController.authenticate,
    FormatController.authorize(["admin"]),
    AdminController.deleteFaculty
);


export default router;