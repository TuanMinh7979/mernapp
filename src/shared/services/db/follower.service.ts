import { IFollowerData } from "@root/features/follower/interfaces/follower.interface";
import { FollowerModel } from "@root/features/follower/models/follower.schema";
import { UserCache } from "@service/redis/user.cache";
import { UserModel } from "@user/models/user.schema";
import { map } from "lodash";
import { BulkWriteResult } from "mongodb";
import mongoose, { mongo } from "mongoose";
import { ObjectId } from "mongodb";
import {
  INotificationDocument,
  INotificationTemplate,
} from "@notification/interfaces/notification.inteface";
import { NotificationModel } from "@notification/models/notification.scheme";
import { socketIONotificationObject } from "@socket/notification";
import { notificationTemplate } from "@service/emails/template/notifications/notification-template";
import { emailQueue } from "@service/queue/email.queue";
import { userService } from "./user.service";
const userCache: UserCache = new UserCache();

class FollowerService {
  //* Params:
  //* userId:
  //* followeeId:
  //* username:
  //* followerDocumentId:
  //* Res:
  public async addFollowerToDB(
    userId: string,
    followeeId: string,
    username: string,
    followDocumentId: ObjectId
  ): Promise<void> {
    const followeeObjectId = new mongoose.Types.ObjectId(followeeId);
    const followerObjectId = new mongoose.Types.ObjectId(userId);

    const newFollow = await FollowerModel.create({
      _id: followDocumentId,
      followeeId: followeeObjectId,
      followerId: followerObjectId,
    });
    // update userModel, update multiple documents on one mongo call
    const users: Promise<BulkWriteResult> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: {
            $inc: { followingCount: 1 },
          },
        },
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: {
            $inc: { followersCount: 1 },
          },
        },
      },
    ]);
    const response = await Promise.all([
      users,
      userService.getUserById(followeeId),
    ]);

    // ! CMN NOTI:
    if (response[1]?.notifications.follows && userId !== followeeId) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notifications = await notificationModel.insertNotification({
        userFrom: userId,
        userTo: followeeId,
        message: `${username} follow you`,
        notificationType: "follow",
        entityId: new mongoose.Types.ObjectId(userId),
        createdItemId: new mongoose.Types.ObjectId(newFollow._id),
        createdAt: new Date(),
        comment: "",
        post: "",
        imgId: "",
        imgVersion: "",
        gifUrl: "",
        reaction: "",
      });

      //send to client with socketIO
      // ! Socket:
      socketIONotificationObject.emit("insert notification", notifications, {
        userTo: followeeId,
      });
      //send to emailQueue
      // //  ! Email:
      // const templateParams: INotificationTemplate = {
      //   username: response[1]?.username!, // userTo
      //   message: `${username} follow on you`, //user From
      //   header: "Notification of new Follow",
      // };

      // const template: string =
      //   notificationTemplate.notificationMessageTemplate(templateParams);
      // // ! Queue:

      // emailQueue.addEmailJob("followNotiEmail", {
      //   receiverEmail: response[1].email!,
      //   template,
      //   subject: "Follow Notification ",
      // });
    }
  }
  //* Params:
  //* followeeId: famous people
  //* followerId: people is a fan
  //* Res:void
  public async removeFollowerFromDB(
    followeeId: string,
    followerId: string
  ): Promise<void> {
    const followeeObjectId = new mongoose.Types.ObjectId(followeeId);
    const followerObjectId = new mongoose.Types.ObjectId(followerId);

    const unfollow = FollowerModel.deleteOne({
      followeeId: followeeObjectId,
      followerId: followerObjectId,
    });

    const users: Promise<BulkWriteResult> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: followerId },
          update: { $inc: { followingCount: -1 } },
        },
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followersCount: -1 } },
        },
      },
    ]);
    await Promise.all([unfollow, users]);
  }

  //* Params:
  //* userObjectId:  get all idol of a fan
  //* Res: IFollowerData[]
  public async getFolloweeData(
    userObjectId: ObjectId
  ): Promise<IFollowerData[]> {
    const followee: IFollowerData[] = await FollowerModel.aggregate([
      { $match: { followerId: userObjectId } },
      {
        $lookup: {
          from: "User",
          localField: "followeeId",
          foreignField: "_id",
          as: "followeeId",
        },
      },
      { $unwind: "$followeeId" },
      {
        $lookup: {
          from: "Auth",
          localField: "followeeId.authId",
          foreignField: "_id",
          as: "authId",
        },
      },
      { $unwind: "$authId" },
      {
        $addFields: {
          _id: "$followeeId._id", //UserModel._id
          username: "$authId.username", //AuthModel.username
          avatarColor: "$authId.avatarColor",
          uId: "$authId.uId",
          postCount: "$followeeId.postCount",
          followersCount: "$followeeId.followersCount",
          followingCount: "$followeeId.followingCount",
          profilePicture: "$followeeId.profilePicture",
          userProfile: "$followeeId.userProfile",
        },
      },
      {
        $project: {
          authId: 0,
          followerId: 0,
          followeeId: 0,
          createdAt: 0,
          __v: 0,
        },
      },
    ]);
    return followee;
  }
  //* Params:
  //* userObjectId:  get all fan of a idol
  //* Res: IFollowerData[]
  public async getFollowerData(
    userObjectId: ObjectId
  ): Promise<IFollowerData[]> {
    const follower: IFollowerData[] = await FollowerModel.aggregate([
      { $match: { followeeId: userObjectId } },
      {
        $lookup: {
          from: "User",
          localField: "followerId",
          foreignField: "_id",
          as: "followerId",
        },
      },
      { $unwind: "$followerId" },
      {
        $lookup: {
          from: "Auth",
          localField: "followerId.authId",
          foreignField: "_id",
          as: "authId",
        },
      },
      { $unwind: "$authId" },
      {
        $addFields: {
          _id: "$followerId._id", //UserModel._id
          username: "$authId.username", //AuthModel.username
          avatarColor: "$authId.avatarColor",
          uId: "$authId.uId",
          postCount: "$followerId.postCount",
          followersCount: "$followerId.followersCount",
          followingCount: "$followerId.followingCount",
          profilePicture: "$followerId.profilePicture",
          userProfile: "$followerId.userProfile",
        },
      },
      {
        $project: {
          authId: 0,
          followerId: 0,
          followeeId: 0,
          createdAt: 0,
          __v: 0,
        },
      },
    ]);
    return follower;
  }

  //* Params:
  //* userId: userId of user to get all idol
  //* Res: String[] as list of idol ids string
  public async getFolloweesIds(userId: string): Promise<string[]> {
    const followee = await FollowerModel.aggregate([
      { $match: { followerId: new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          followeeId: 1,
          _id: 0,
        },
      },
    ]);
    console.log(map(followee, (result) => result.followeeId.toString()));
    return followee.map((result) => result.followeeId.toString());
  }
}

export const followerService: FollowerService = new FollowerService();
