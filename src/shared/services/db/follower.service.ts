import { FollowerModel } from "@root/features/follower/models/follower.schema";
import { UserCache } from "@service/redis/user.cache";
import { UserModel } from "@user/models/user.schema";
import { map } from "lodash";
import { BulkWriteResult } from "mongodb";
import mongoose, { ObjectId, mongo } from "mongoose";
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
    await Promise.all([users, UserModel.findOne({ _id: followeeId })]);
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

  //   public async getFolloweeData(
  //     userObjectId: ObjectId
  //   ): Promise<IFollowerData[]> {}

  //   public async getFollowerData(
  //     userObjectId: ObjectId
  //   ): Promise<IFollowerData[]> {}

  //   public async getFolloweesIds(userId: string): Promise<string[]> {}
}

export const followerService: FollowerService = new FollowerService();
