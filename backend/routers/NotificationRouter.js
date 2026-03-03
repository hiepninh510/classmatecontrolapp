import { Router } from "express";
import * as NotificationController from "../src/controller/NotificationController.js"
const router = Router();
router.post('/',NotificationController.creatNotification);
router.post('/notification-from-admin',NotificationController.createNotificationFromAdmin);
router.get("/id-user-to-notification",NotificationController.getIdUserToNotification);
router.delete("/one-notification",NotificationController.deleteOneNotification);
router.delete("/all-notification",NotificationController.deleteAllNotification);
router.put("/",NotificationController.updateIsRead);
router.put("/all-notifications",NotificationController.readAllNotifications);
router.get('/',NotificationController.getNotifications);

export default router;