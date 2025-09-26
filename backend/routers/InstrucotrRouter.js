import { Router } from "express";
import * as InstructorController from '../src/controller/InstructorController.js'
import * as FormatController from "../src/controller/formatController.js"

const router = Router();
router.get("/getSubjects/:id",InstructorController.getSubjects);
router.get('/getAllClass/:id',InstructorController.getAllClass);
router.post('/assignLessionForClass',InstructorController.assignLessionForClass);
router.get('/',InstructorController.findIdInstructor);
router.post('/',FormatController.validatePhoneNumber,InstructorController.createInstructor);

export default router;