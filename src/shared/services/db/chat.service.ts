import { IMessageData } from "@chat/interfaces/chat.interface";
import { IConversationDocument } from "@chat/interfaces/conversation.interface";

import { MessageModel } from "@chat/models/chat.schema";
import { ConversationModel } from "@chat/models/converation.scheme";
import { ObjectId } from "mongodb";

class ChatService {
  //  * Params:
  //  * Res:
  public async addMessageToDB(data: IMessageData): Promise<void> {
    const conversation: IConversationDocument[] = await ConversationModel.find({
      _id: data?.conversationId,
    }).exec();
    if (conversation.length === 0) {
      await ConversationModel.create({
        _id: data?.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId,
      });
    }

    await MessageModel.create({
      _id: data._id,
      conversationId: data.conversationId,
      receiverId: data.receiverId,
      receiverUsername: data.receiverUsername,
      receiverAvatarColor: data.receiverAvatarColor,
      receiverProfilePicture: data.receiverProfilePicture,
      senderUsername: data.senderUsername,
      senderId: data.senderId,
      senderAvatarColor: data.senderAvatarColor,
      senderProfilePicture: data.senderProfilePicture,
      body: data.body,
      isRead: data.isRead,
      gifUrl: data.gifUrl,
      selectedImage: data.selectedImage,
      reaction: data.reaction,
      createdAt: data.createdAt,
    });
  }

  //  * Params:
  //  * Res:
  //  func get conversation and last message data to show in  chat sidebar
  public async getUserConversationAndLstMessageList(
    userId: ObjectId
  ): Promise<IMessageData[]> {
    const messages: IMessageData[] = await MessageModel.aggregate([
      { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
      //   get last document use $group
      {
        $group: {
          _id: "$conversationId",
          result: { $last: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: "$result._id",
          conversationId: "$result.conversationId",
          receiverId: "$result.receiverId",
          receiverUsername: "$result.receiverUsername",
          receiverAvatarColor: "$result.receiverAvatarColor",
          receiverProfilePicture: "$result.receiverProfilePicture",
          senderUsername: "$result.senderUsername",
          senderId: "$result.senderId",
          senderAvatarColor: "$result.senderAvatarColor",
          senderProfilePicture: "$result.senderProfilePicture",
          body: "$result.body",
          isRead: "$result.isRead",
          gifUrl: "$result.gifUrl",
          selectedImage: "$result.selectedImage",
          reaction: "$result.reaction",
          createdAt: "$result.createdAt",
          deleteForEveryone: "$result.deleteForEveryone",
          deletedByUsers: "$result.deletedByUsers",
        },
      },
      { $sort: { createdAt: 1 } },
    ]);

    return messages;
  }

  //  * Params:
  //  * Res:
  // function get all messages from a conversation
  public async getMessages(
    senderId: ObjectId,
    receiverId: ObjectId,
    sort: Record<string, 1 | -1>
  ): Promise<IMessageData[]> {
    const query = {
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    };
    const messages: IMessageData[] = await MessageModel.aggregate([
      { $match: query },
      { $sort: sort },
    ]);
    return messages;
  }

  //  * Params:
  //  * Res:
  public async markMessageAsDeleted(
    messageId: string,
    type: string,
    userId: string
  ): Promise<IMessageData> {
    

    if (type === "deleteForMe") {
      return (await MessageModel.findOneAndUpdate(
        { _id: messageId },

        { $push: { deletedByUsers: userId } },
        { new: true }
      )) as IMessageData;
    } else {
      // delete for all user
      return (await MessageModel.findOneAndUpdate(
        { _id: messageId },
        { $set: { deletedByUsers: [], deleteForEveryone: true } },
        { new: true }
      )) as IMessageData;
    }
  }

  //  * Params:
  //  * Res:
  public async markMessagesAsRead(
    senderId: ObjectId,
    receiverId: ObjectId
  ): Promise<IMessageData> {
    const query = {
      $or: [
        { senderId, receiverId, isRead: false },
        { senderId: receiverId, receiverId: senderId, isRead: false },
      ],
    };
    // update for sender and receiver, user update many
    await MessageModel.updateMany(query, { $set: { isRead: true } }).exec();
    const latestItem: IMessageData = (await MessageModel.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({
      createdAt: -1,
    })) as unknown as IMessageData;

    return latestItem;
  }

  //  * Params:
  //  * Res:
  public async updateMessageReaction(
    messageId: ObjectId,
    senderName: string,
    reaction: string,
    type: "add" | "remove"
  ): Promise<any> {
    const rs = await MessageModel.findOneAndUpdate(
      { _id: messageId, reaction: { $elemMatch: { senderName: senderName } } },
      { $pull: { reaction: { senderName } } },
      { new: true }
    );
    if (type == "remove") {
      return rs;
    } else {
      return await MessageModel.findOneAndUpdate(
        { _id: messageId },
        { $push: { reaction: { senderName, type: reaction } } },
        { new: true }
      );
    }
  }
}

export const chatService: ChatService = new ChatService();
