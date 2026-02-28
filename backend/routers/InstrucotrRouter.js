import { Router } from "express";
import * as InstructorController from '../src/controller/InstructorController.js'
import * as FormatController from "../src/controller/formatController.js"

const router = Router();
router.get("/subjects-of-instructor/:id",
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    InstructorController.getSubjectsOfInstructor
);

router.get('/all-classes/:id',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    InstructorController.getAllClass
);

router.get('/subject-was-assigned/:id',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    InstructorController.getAssignedSubject
);

router.get('/list-student-to-enter-score',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    InstructorController.getListStudentToEnterScore
);

router.get('/mySchedules/:id',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    InstructorController.getMySchedules
);

router.get('/',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    InstructorController.findIdInstructor
);


router.post('/assignLessionForClass',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    InstructorController.assignLessionForClass
);

router.put('/saveScore',
    FormatController.authenticate,
    FormatController.authorize(["instructor","admin"]),
    InstructorController.saveScore
);


export default router;