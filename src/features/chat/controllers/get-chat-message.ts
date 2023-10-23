import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
import mongoose from "mongoose";

import { chatService } from "@service/db/chat.service";
import { IMessageData } from "@chat/interfaces/chat.interface";

// const messageCache: MessageCache = new MessageCache();

export class Get {
  //  Params:
  //  Res:
  public async conversationList(req: Request, res: Response): Promise<void> {
    let list: IMessageData[] = [];
    
    //  ! Service:
    list = await chatService.getUserConversationAndLstMessageList(
      new mongoose.Types.ObjectId(req.currentUser!.userId)
    );
    res
      .status(HTTP_STATUS.OK)
      .json({ message: "User conversation list", list });
  }

  // * Params:
  //   * receiverId: id of target receiver
  // * Res:
  public async messages(req: Request, res: Response): Promise<void> {
    const { receiverId } = req.params;
    let messages: IMessageData[] = [];

    // ! Service:
    messages = await chatService.getMessages(
      new mongoose.Types.ObjectId(req.currentUser!.userId),
      new mongoose.Types.ObjectId(receiverId),
      { createdAt: 1 }
    );

    res
      .status(HTTP_STATUS.OK)
      .json({ message: "User chat messages", messages });
  }
}
