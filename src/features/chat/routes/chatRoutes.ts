import { Add } from "@chat/controllers/add-chat-messages";
import { Message } from "@chat/controllers/add-message-reaction";
import { Delete } from "@chat/controllers/delete-chat-message";
import { Get } from "@chat/controllers/get-chat-message";
import { Update } from "@chat/controllers/update-chat-message";
import { authMiddleware } from "@global/helpers/aurth-middleware";
import express, { Router } from "express";

class ChatRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get(
      "/chat/message/conversations",
      authMiddleware.checkAuthencation,
      Get.prototype.conversationList
    );
    this.router.get(
      "/chat/message/user/:receiverId",
      authMiddleware.checkAuthencation,
      Get.prototype.messages
    );
    this.router.post(
      "/chat/message",
      authMiddleware.checkAuthencation,
      Add.prototype.message
    );
    this.router.post(
      "/chat/message/add-chat-users",
      authMiddleware.checkAuthencation,
      Add.prototype.addChatUsers
    );
    this.router.post(
      "/chat/message/remove-chat-users",
      authMiddleware.checkAuthencation,
      Add.prototype.removeChatUsers
    );
    this.router.delete(
      "/chat/message/mark-as-deleted/:messageId/:senderId/:receiverId/:type",
      authMiddleware.checkAuthencation,
      Delete.prototype.markMessageAsDeleted
    );
    this.router.put(
      "/chat/message/mark-as-readed",
      authMiddleware.checkAuthencation,
      Update.prototype.message
    );
    this.router.put(
      "/chat/message/reaction",
      authMiddleware.checkAuthencation,
      Message.prototype.reaction
    );
    return this.router;
  }
}

export const chatRoutes: ChatRoutes = new ChatRoutes();
