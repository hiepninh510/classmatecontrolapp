import { Router } from "express";
import * as StudentController from "../src/controller/StudentController.js"
import * as FormatController from "../src/controller/formatController.js"
const router = Router();

router.post('/assignLesson',FormatController.validatePhoneNumber,StudentController.assignLesson);
router.post('/addStudent',FormatController.validatePhoneNumber,StudentController.addStudent);
router.post('/markLessionDone',FormatController.validatePhoneNumber,StudentController.markLessionDone);
// router.post('/sentEmailToSetup',FormatController.validatePhoneNumber,StudentController.sentEmailToSetUp);
router.post('/setupAccount',StudentController.setUpAccount);
router.post('/loginEmail',StudentController.loginEmail);
router.post('/validateAccessCodeStudent',StudentController.validateAccessCode);
router.get('/myLessions',StudentController.getMyLession);
router.get('/students',StudentController.getStudentList);
router.put('/editStudent/:phone',StudentController.updateStudent);
router.put('/editProfile',FormatController.validatePhoneNumber,StudentController.editPofile)
router.delete('/deleteStudent/:phone',StudentController.deleteStudent);
router.get('/:phone',StudentController.getOneStudent);

export default router;