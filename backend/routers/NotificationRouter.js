import { Router } from "express";
import * as NotificationController from "../src/controller/NotificationController.js"
const router = Router();
router.post('/',NotificationController.creatNotification);
router.get("/getIdUserToNotification",NotificationController.getIdUserToNotification);
router.get('/',NotificationController.getNotifications);

export default router;