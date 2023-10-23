import { IAuthDocument } from "@auth/interfaces/auth.interface";
import { AuthModel } from "@auth/models/auth.schema";
import { config } from "@root/config";
import {
  IBasicInfo,
  INotificationSettings,
  ISearchUser,
  ISocialLinks,
  IUserAuthDocument,
  IUserDocument,
} from "@user/interface/user.interface";
import { UserModel } from "@user/models/user.schema";
import Logger from "bunyan";
import mongoose from "mongoose";
import { followerService } from "./follower.service";

const log: Logger = config.createLogger("UserService");
class UserService {
  public async create(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }

  //   * Params:
  //   * authId:id of Auth collection
  //   * Res: IUserAuthDocument
  public async getUserByAuthId(authId: string): Promise<IUserAuthDocument> {
    const users: IUserAuthDocument[] = await UserModel.aggregate([
      { $match: { authId: new mongoose.Types.ObjectId(authId) } },
    ]);
    return users[0];
  }
  //   * Params:
  //   * userId:_id of User collection
  //   * Res: IUserAuthDocument
  public async getUserAuthByUserId(userId: string): Promise<IUserAuthDocument> {
    const users: IUserAuthDocument[] = await UserModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "Auth",
          localField: "authId",
          foreignField: "_id",
          as: "auth",
        },
      },
      { $unwind: "$auth" },
      { $project: this.aggregateProject() },
    ]);

    return users[0];
  }

  private aggregateProject() {
    return {
      _id: 1,
      username: "$auth.username",
      authId: "$auth._id",
      email: "$auth.email",
      avatarColor: "$auth.avatarColor",
      createdAt: "$auth.createdAt",
    
      postsCount: 1,
      work: 1,
      school: 1,
      quote: 1,
      location: 1,
      blocked: 1,
      blockedBy: 1,
      followersCount: 1,
      followingCount: 1,
      notifications: 1,
      social: 1,
      bgImageVersion: 1,
      bgImageId: 1,
      profilePicture: 1,
    };
  }

  // *Param:
  //* userId: userId to remove
  // *Res:
  //  function to get all users
  public async getAllUsers(
    userId: string,
    skip: number,
    limit: number
  ): Promise<IUserAuthDocument[]> {


    const users: IUserAuthDocument[] = await UserModel.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } },
      { $skip: skip },
      { $limit: limit },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "Auth",
          localField: "authId",
          foreignField: "_id",
          as: "auth",
        },
      },
      { $unwind: "$auth" },
      { $project: this.aggregateProject() },
    ]);


    return users;
  }

  public async getTotalUsersInDB(): Promise<number> {
    const totalCount: number = await UserModel.find({}).countDocuments();
    return totalCount;
  }

  // *Params:
  // *Res:
  // get strange user to add follow for current user(aka a fan)
  public async getRandomUsers(userId: string): Promise<IUserAuthDocument[]> {
    const randomUsers: IUserAuthDocument[] = [];
    const strangeUsers: IUserAuthDocument[] = await UserModel.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } },
      {
        $lookup: {
          from: "Auth",
          localField: "authId",
          foreignField: "_id",
          as: "authId",
        },
      },
      { $unwind: "$authId" },
      { $sample: { size: 10 } },
      {
        $addFields: {
          username: "$authId.username",
          email: "$authId.email",
          avatarColor: "$authId.avatarColor",

          createdAt: "$authId.createdAt",
        },
      },
      {
        $project: {
          authId: 0,
          __v: 0,
        },
      },
    ]);
    // get all fan id string
    const followers: string[] = await followerService.getFolloweesIds(
      `${userId}`
    );

    for (const strangeUser of strangeUsers) {
      const followerIndex = followers.indexOf(strangeUser._id.toString());
      if (followerIndex < 0) {
        // * if(user not is a follower)
        randomUsers.push(strangeUser);
      }
    }
    return randomUsers;
  }

  // *Params:
  // *Res:
  // function search user by username
  public async searchUsers(regex: RegExp): Promise<ISearchUser[]> {
    const users = await AuthModel.aggregate([
      { $match: { username: regex } },
      {
        $lookup: {
          from: "User",
          localField: "_id",
          foreignField: "authId",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: "$user._id",
          username: 1,
          email: 1,
          avatarColor: 1,
          profilePicture: "$user.profilePicture",
        },
      },
    ]);
    return users;
  }

  public async updatePassword(
    username: string,
    hashedPassword: string
  ): Promise<void> {
    await AuthModel.updateOne(
      { username },
      { $set: { password: hashedPassword } }
    ).exec();
  }

  public async updateUserInfo(userId: string, info: IBasicInfo): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          work: info["work"],
          school: info["school"],
          quote: info["quote"],
          location: info["location"],
        },
      }
    ).exec();
  }
  public async updateBackgroundImage(userId: string, body: any): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          bgImageVersion: body["bgImageVersion"],
          bgImageId: body["bgImageId"],
        },
      }
    ).exec();
  }

  public async updateSocialLinks(
    userId: string,
    links: ISocialLinks
  ): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: { social: links },
      }
    ).exec();
  }

  public async updateNotificationSettings(
    userId: string,
    settings: INotificationSettings
  ): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      { $set: { notifications: settings } }
    ).exec();
  }
}

export const userService: UserService = new UserService();
