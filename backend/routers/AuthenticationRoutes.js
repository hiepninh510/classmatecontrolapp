import { Router } from "express";
import * as AuthenticationController from "../src/controller/AuthenticationController.js"
import * as StudentController from "../src/controller/StudentController.js"
import * as FormatController from "../src/controller/formatController.js"
const router = Router();

router.post('/validateAccessCode',FormatController.validatePhoneNumber,AuthenticationController.validateAccessCode);
router.post('/login',FormatController.validatePhoneNumber,AuthenticationController.createAccessCode);
router.post('/forgot-password',FormatController.convertEmailToPhoneNumber,StudentController.loginEmail);
router.delete('/deleteAccode',AuthenticationController.deleteAccode);
router.post('/forgetPassWord',AuthenticationController.forgetPassWord);
router.put('/changePassWord',AuthenticationController.changePassWord);
router.post('/',FormatController.verifyRecaptcha,AuthenticationController.defaultLogin);
export default router;