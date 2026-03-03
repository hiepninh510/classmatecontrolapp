import { Router } from "express";
import * as StudentController from "../src/controller/StudentController.js"
import * as FormatController from "../src/middleware/formatController.js"
const router = Router();

router.post('/lesson',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    FormatController.validatePhoneNumber,
    StudentController.assignLesson
);

router.post('/student',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    FormatController.validatePhoneNumber,
    StudentController.addStudent
);

router.post('/lession-done',
    FormatController.authenticate,
    FormatController.authorize(["student","admin"]),
    FormatController.validatePhoneNumber,
    StudentController.markLessionDone
);
// router.post('/sentEmailToSetup',FormatController.validatePhoneNumber,StudentController.sentEmailToSetUp);
router.put('/lession',
    FormatController.authenticate,
    FormatController.authorize(["student","admin"]),
    StudentController.finishLession
);

router.post('/setupAccount'
    ,FormatController.authenticate,
    FormatController.authorize(["student","admin"]),
    StudentController.setUpAccount
);

router.post('/loginEmail',
    StudentController.loginEmail
);

router.post('/validateAccessCodeStudent',
    StudentController.validateAccessCode
);

router.get('/myLessions',
    FormatController.authenticate,
    FormatController.authorize(["student","admin"]),
    StudentController.getMyLession
);

router.get('/students/:id',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    StudentController.getStudentList
);

router.get('/my-scores/:id',
    FormatController.authenticate,
    FormatController.authorize(["student","admin"]),
    StudentController.getMyScores
);

router.get('/my-schedules/:id',
    FormatController.authenticate,
    FormatController.authorize(["student","admin"]),
    StudentController.getMyShedules
);

router.get('/:phone',
    FormatController.authenticate,
    FormatController.authorize(["instructor","student","admin"]),
    StudentController.getOneStudent
);

router.put('/edit-student/:phone',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    StudentController.updateStudent
);

router.put('/editProfile',
    FormatController.authenticate,
    FormatController.authorize(["student","admin"]),
    FormatController.validatePhoneNumber,
    StudentController.editPofile
);

router.delete('/deleteStudent/:phone',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    StudentController.deleteStudent
);


export default router;