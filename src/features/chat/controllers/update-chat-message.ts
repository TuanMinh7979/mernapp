import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
import mongoose from "mongoose";

import { joiValidation } from "@global/decorators/joi-validation.decorators";
import { markChatSchema } from "@chat/schemes/chat";

import { chatService } from "@service/db/chat.service";
import { socketIOChatObject } from "@socket/chat";

export class Update {
  // * Params:
  // * Res:
  @joiValidation(markChatSchema)
  public async message(req: Request, res: Response): Promise<void> {
    const { senderId, receiverId } = req.body;
    // ! Service
    const lastedMessage = await chatService.markMessagesAsRead(
      senderId,
      receiverId
    );
    socketIOChatObject.to(senderId).emit("message read", lastedMessage);
    socketIOChatObject.to(senderId).emit("chat list", lastedMessage);
    socketIOChatObject.to(receiverId).emit("message read", lastedMessage);
    socketIOChatObject.to(receiverId).emit("chat list", lastedMessage);
    res.status(HTTP_STATUS.OK).json({ message: "Message marked as read" });
  }
}
