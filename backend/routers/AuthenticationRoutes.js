import { Router } from "express";
import * as AuthenticationController from "../src/controller/AuthenticationController.js"
import * as FormatController from "../src/controller/formatController.js"
const router = Router();

router.post('/validateAccessCode',FormatController.validatePhoneNumber,AuthenticationController.validateAccessCode);
router.post('/',FormatController.validatePhoneNumber,AuthenticationController.createAccessCode);
export default router;