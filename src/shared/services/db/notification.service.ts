import { INotificationDocument } from "@notification/interfaces/notification.inteface";
import { NotificationModel } from "@notification/models/notification.scheme";
import mongoose from "mongoose";

class NotificationService {
  // * Param:
  //   *userId: get notification of this userId(noti to this userId)
  // * Res:
  public async getNotifications(
    userId: string
  ): Promise<INotificationDocument[]> {
    const notifications: INotificationDocument[] =
      await NotificationModel.aggregate([
        { $match: { userTo: new mongoose.Types.ObjectId(userId) } },
        {
          $lookup: {
            from: "User",
            localField: "userFrom",
            foreignField: "_id",
            as: "userFrom",
          },
        },
        { $unwind: "$userFrom" },
        {
          $lookup: {
            from: "Auth",
            localField: "userFrom.authId",
            foreignField: "_id",
            as: "authId",
          },
        },
        { $unwind: "$authId" },
        {
          $project: {
            _id: 1,
            message: 1,
            comment: 1,
            createdAt: 1,
            createdItemId: 1,
            entityId: 1,
            notificationType: 1,
            gifUrl: 1,
            imgId: 1,
            imgVersion: 1,
            post: 1,
            reaction: 1,
            read: 1,
            userTo: 1,
            userFrom: {
              profilePicture: "$userFrom.profilePicture",
              username: "$authId.username",
              avatarColor: "$authId.avatarColor",
              uId: "$authId.uId",
            },
          },
        },
      ]);
    return notifications;
  }
  // * Param:
  //   *notificationId: update noti as readed
  // * Res:
  public async updateNotification(notificationId: string): Promise<void> {
    await NotificationModel.updateOne(
      { _id: notificationId },
      { $set: { read: true } }
    ).exec();
  }
  // * Param:
  //   *notificationId: delete noti
  // * Res:
  public async deleteNotification(notificationId: string): Promise<void> {
    await NotificationModel.deleteOne({ _id: notificationId }).exec();
  }
}

export const notificationService: NotificationService =
  new NotificationService();