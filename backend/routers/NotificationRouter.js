import { Router } from "express";
import * as NotificationController from "../src/controller/NotificationController.js"
const router = Router();
router.post('/',NotificationController.creatNotification);
router.post('/createNotificationFromAdmin',NotificationController.createNotificationFromAdmin);
router.get("/getIdUserToNotification",NotificationController.getIdUserToNotification);
router.delete("/deleteOneNotification",NotificationController.deleteOneNotification);
router.delete("/deleteAllNotification",NotificationController.deleteAllNotification);
router.put("/",NotificationController.updateIsRead);
router.put("/readAllNotifications",NotificationController.readAllNotifications);
router.get('/',NotificationController.getNotifications);

export default router;