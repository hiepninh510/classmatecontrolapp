import { Router } from "express";
import * as ChatsSocketIO from '../src/chatSocketio/chats.js';
import * as FormatController from "../src/controller/formatController.js";

const router = Router();
router.post('/messages',
    FormatController.authenticate,
    FormatController.authorize(["student","instructor","admin"]),
    ChatsSocketIO.openChatRoom
);
router.post('/messagesStudent',
    FormatController.authenticate,
    FormatController.authorize(["student","instructor","admin"]),
    ChatsSocketIO.openChatRoomOfStudent
);

router.post('/',
    FormatController.authenticate,
    FormatController.authorize(["student","instructor","admin"]),
    ChatsSocketIO.chatWithStudent
);

router.get('/messages/:idRoom/:phoneNumber',
    FormatController.authenticate,
    FormatController.authorize(["instructor","student","admin"]),
    ChatsSocketIO.getMessagesOfRoom
);

export default router;