import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";

import { joiValidation } from "@global/decorators/joi-validation.decorators";
import { addChatSchema } from "@chat/schemes/chat";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { UploadApiResponse } from "cloudinary";
import { upload } from "@global/helpers/cloudinary-upload";
import { BadRequestError } from "@global/helpers/error-handler";
import {
  IMessageData,
  IMessageNotification,
} from "@chat/interfaces/chat.interface";

import { socketIOChatObject } from "@socket/chat";

import { userService } from "@service/db/user.service";
import { chatService } from "@service/db/chat.service";
import { userOnRoom } from "@socket/chat";
export class Add {
  //* Param:
  //* Res:
  @joiValidation(addChatSchema)
  public async message(req: Request, res: Response): Promise<void> {
    const {
      conversationId,
      receiverId,
      receiverUsername,
      receiverAvatarColor,
      receiverProfilePicture,
      body,
      gifUrl,
      isRead,
      selectedImage,
    } = req.body;



    const messageObjectId: ObjectId = new ObjectId();
    const conversationObjectId: ObjectId = !conversationId
      ? new ObjectId()
      : new mongoose.Types.ObjectId(conversationId);

    //  ! 1. get sender user info
    //  ! Service:
    const sender = await userService.getUserAuthByUserId(
      req.currentUser!.userId
    );

    // ! 2. if selectedImage then upload this image
    let fileUrl = "";
    if (selectedImage.length) {
      const result: UploadApiResponse = (await upload(
        req.body.selectedImage,
        req.currentUser!.userId,
        true,
        true
      )) as UploadApiResponse;
      if (!result?.public_id) {
        throw new BadRequestError(result.message);
      }
      fileUrl = result.url;
    }

    // ! 3.create messageModel from (1) and (2)
    let isTargetOnline = false;

    if (conversationId) {


      const targetSocketId = userOnRoom.get(receiverId) as string;
      const targetSocket =
        socketIOChatObject.sockets.sockets.get(targetSocketId);

      if (targetSocket) {
        // check if target socket has joined the room or not
        isTargetOnline = targetSocket.rooms.has(`room_${conversationId}`);
   
      }
    }

    const messageData: IMessageData = {
      _id: `${messageObjectId}`,
      conversationId: new mongoose.Types.ObjectId(conversationObjectId),
      receiverId,
      receiverAvatarColor,
      receiverProfilePicture,
      receiverUsername,
      senderUsername: `${req.currentUser!.username}`,
      senderId: `${req.currentUser!.userId}`,
      senderAvatarColor: `${req.currentUser!.avatarColor}`,
      senderProfilePicture: `${sender.profilePicture}`,
      body,
      isRead: isTargetOnline,
      gifUrl,
      selectedImage: fileUrl,
      reaction: [],
      createdAt: new Date(),
      deleteForEveryone: false,
      deletedByUsers: [],
    };


    // ! 4.emit socket "chat list", "messgage receied" to sender and received(4 emit)
    Add.prototype.emitSocketIOEvent(messageData);
    //  ! Service
    //! 5.save message data to db.Message
    await chatService.addMessageToDB(messageData);

    res.status(HTTP_STATUS.OK).json({
      message: "Message added",
      conversationId: conversationObjectId.toString(),
    });
  }
  //

  private emitSocketIOEvent(data: IMessageData): void {
    // update chat messgaes
    const { senderId, receiverId } = data;
    socketIOChatObject.to(senderId).emit("message received", data);
    socketIOChatObject.to(senderId).emit("chat list", data);
    socketIOChatObject.to(receiverId).emit("message received", data);
    socketIOChatObject.to(receiverId).emit("chat list", data);
  }
}
