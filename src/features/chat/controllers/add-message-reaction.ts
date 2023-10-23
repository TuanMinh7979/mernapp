import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
import mongoose from "mongoose";

import { chatService } from "@service/db/chat.service";
import { socketIOChatObject } from "@socket/chat";

export class Message {
  // * Params:
  // * Res:
  public async reaction(req: Request, res: Response): Promise<void> {
    const { conversationId, messageId, reaction, type } = req.body;

    //  ! Service
    const rs = await chatService.updateMessageReaction(
      messageId,
      req.currentUser!.username,
      reaction,
      type
    );


    socketIOChatObject.to(rs.senderId.toString()).emit("message reaction", rs);
    socketIOChatObject.to(rs.receiverId.toString()).emit("message reaction", rs);
    res.status(HTTP_STATUS.OK).json({ message: "Message reaction added" });
  }
}
