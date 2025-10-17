import { Router } from "express";
import * as InstructorController from '../src/controller/InstructorController.js'
import * as FormatController from "../src/controller/formatController.js"

const router = Router();
router.get("/getSubjects/:id",
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    InstructorController.getSubjects);

router.get('/getAllClass/:id',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    InstructorController.getAllClass);

router.get('/getAssignedSubject/:id',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    InstructorController.getAssignedSubject);

router.get('/getListStudentToEnterScore',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    InstructorController.getListStudentToEnterScore);

router.post('/assignLessionForClass',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    InstructorController.assignLessionForClass);

router.put('/saveScore',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    InstructorController.saveScore);

router.get('/getMySchedules/:id',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    InstructorController.getMySchedules);

router.get('/',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    InstructorController.findIdInstructor);


export default router;