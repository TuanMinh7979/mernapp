import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
import mongoose from "mongoose";

import { chatService } from "@service/db/chat.service";
import { socketIOChatObject } from "@socket/chat";

export class Delete {
  public async markMessageAsDeleted(
    req: Request,
    res: Response
  ): Promise<void> {
    const { senderId, receiverId, messageId, type } = req.params;

    //  ! Service



    const updatedMessage = await chatService.markMessageAsDeleted(
      messageId,
      type,
      req?.currentUser?.userId as string
    );

    // ! Socket:
    socketIOChatObject.to(senderId).emit("message read", updatedMessage);
    socketIOChatObject.to(senderId).emit("chat list", updatedMessage);
    socketIOChatObject.to(receiverId).emit("message read", updatedMessage);
    socketIOChatObject.to(receiverId).emit("chat list", updatedMessage);
    res.status(HTTP_STATUS.OK).json({ message: "Message marked as deleted" });
  }
}
