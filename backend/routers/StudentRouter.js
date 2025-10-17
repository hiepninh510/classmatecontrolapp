import { Router } from "express";
import * as StudentController from "../src/controller/StudentController.js"
import * as FormatController from "../src/controller/formatController.js"
const router = Router();

router.post('/assignLesson',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    FormatController.validatePhoneNumber,
    StudentController.assignLesson);

router.post('/addStudent',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    FormatController.validatePhoneNumber,
    StudentController.addStudent);

router.post('/markLessionDone',
    FormatController.authenticate,
    FormatController.authorize(["student","admin"]),
    FormatController.validatePhoneNumber,
    StudentController.markLessionDone);
// router.post('/sentEmailToSetup',FormatController.validatePhoneNumber,StudentController.sentEmailToSetUp);
router.put('/finishLession',
    FormatController.authenticate,
    FormatController.authorize(["student","admin"]),
    StudentController.finishLession);

router.post('/setupAccount'
    ,FormatController.authenticate,
    FormatController.authorize(["student","admin"]),
    StudentController.setUpAccount);

router.post('/loginEmail',
    StudentController.loginEmail);

router.post('/validateAccessCodeStudent',
    StudentController.validateAccessCode);

router.get('/myLessions',
    FormatController.authenticate,
    FormatController.authorize(["student","admin"]),
    StudentController.getMyLession);

router.get('/students/:id',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    StudentController.getStudentList);

router.get('/getMyScores/:id',
    FormatController.authenticate,
    FormatController.authorize(["student","admin"]),
    StudentController.getMyScores);

router.get('/getMySchedules/:id',
    FormatController.authenticate,
    FormatController.authorize(["student","admin"]),
    StudentController.getMyShedules);

router.put('/editStudent/:phone',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    StudentController.updateStudent);

router.put('/editProfile',
    FormatController.authenticate,
    FormatController.authorize(["student","admin"]),
    FormatController.validatePhoneNumber,
    StudentController.editPofile)

router.delete('/deleteStudent/:phone',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    StudentController.deleteStudent);

router.get('/:phone',
    FormatController.authenticate,
    FormatController.authorize(["instructor","student","admin"]),
    StudentController.getOneStudent);

export default router;