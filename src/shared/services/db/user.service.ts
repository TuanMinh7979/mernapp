import { IAuthDocument } from "@auth/interfaces/auth.interface";
import { AuthModel } from "@auth/models/auth.schema";
import { config } from "@root/config";
import { IUserDocument } from "@user/interface/user.interface";
import { UserModel } from "@user/models/user.schema";
import Logger from "bunyan";
import mongoose from "mongoose";

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
    log.info("getUserById=> ", users);

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
}

export const userService: UserService = new UserService();
