import { IAuthDocument } from "@auth/interfaces/auth.interface";
import { AuthModel } from "@auth/models/auth.schema";
import { config } from "@root/config";
import {
  IBasicInfo,
  INotificationSettings,
  ISearchUser,
  ISocialLinks,
  IUserDocument,
} from "@user/interface/user.interface";
import { UserModel } from "@user/models/user.schema";
import Logger from "bunyan";
import mongoose from "mongoose";
import { followerService } from "./follower.service";
import { indexOf } from "lodash";
const log: Logger = config.createLogger("UserService");
class UserService {
  public async addUserData(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }

  //   * Params:
  //   * authId:id of Auth collection
  //   * Res: IUserDocument
  public async getUserByAuthId(authId: string): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { authId: new mongoose.Types.ObjectId(authId) } },
      // {
      //   $lookup: {
      //     from: "Auth",
      //     localField: "authId",
      //     foreignField: "_id",
      //     as: "authId",
      //   },
      // },
      // { $unwind: "$authId" },
      // { $project: this.aggregateProject() },
    ]);
    return users[0];
  }
  //   * Params:
  //   * userId:_id of User collection
  //   * Res: IUserDocument
  public async getUserById(userId: string): Promise<IUserDocument> {

    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "Auth",
          localField: "authId",
          foreignField: "_id",
          as: "authId",
        },
      },
      { $unwind: "$authId" },
      { $project: this.aggregateProject() },
    ]);


    return users[0];
  }

  //   * Params:
  //   * uId:uId of Auth collection
  //   * Res: IUserDocument
  public async getUserByUId(uId: string): Promise<IUserDocument> {
    const users: IUserDocument[] = await AuthModel.aggregate([
      {
        $match: {
          uId: uId,
        },
      },

      {
        $lookup: {
          from: "User",
          localField: "_id",
          foreignField: "authId",
          as: "userId",
        },
      },

      {
        $unwind: "$userId",
      },

      {
        $project: {
          _id: "$userId._id",
          username: 1,
          uId: 1,
          email: 1,
          avatarColor: 1,
          createdAt: 1,

          postsCount: "$userId.postsCount",
          work: "$userId.work",
          school: "$userId.school",
          quote: "$userId.quote",
          location: "$userId.location",
          blocked: "$userId.blocked",
          blockedBy: "$userId.blockedBy",
          followersCount: "$userId.followersCount",
          followingCount: "$userId.followingCount",
          notifications: "$userId.notifications",
          social: "$userId.social",
          bgImageVersion: "$userId.bgImageVersion",
          bgImageId: "$userId.bgImageId",
          profilePicture: "$userId.profilePicture",
        },
      },
    ]);
    return users[0];
  }
  private aggregateProject() {
    return {
      _id: 1,
      username: "$authId.username",
      uId: "$authId.uId",
      email: "$authId.email",
      avatarColor: "$authId.avatarColor",
      createdAt: "$authId.createdAt",
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
  ): Promise<IUserDocument[]> {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } },
      { $skip: skip },
      { $limit: limit },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "Auth",
          localField: "authId",
          foreignField: "_id",
          as: "authId",
        },
      },
      { $unwind: "$authId" },
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
  public async getRandomUsers(userId: string): Promise<IUserDocument[]> {
    const randomUsers: IUserDocument[] = [];
    const strangeUsers: IUserDocument[] = await UserModel.aggregate([
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
          uId: "$authId.uId",
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
    console.log(followers);

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
      { $lookup: { from: 'User', localField: '_id', foreignField: 'authId', as: 'user' } },
      { $unwind: '$user' },
      {
        $project: {
          _id: '$user._id',
          username: 1,
          email: 1,
          avatarColor: 1,
          profilePicture: '$user.profilePicture'
        }
      }
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
