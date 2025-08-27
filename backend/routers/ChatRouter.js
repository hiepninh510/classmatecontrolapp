import { Router } from "express";
import * as ChatsSocketIO from '../src/chatSocketio/chats.js'

const router = Router();
router.post('/messages',ChatsSocketIO.openChatRoom)
router.post('/messagesStudent',ChatsSocketIO.openChatRoomOfStudent)
router.get('/messages/:idRoom/:phoneNumber',ChatsSocketIO.getMessagesOfRoom);
router.post('/',ChatsSocketIO.chatWithStudent);
export default router;