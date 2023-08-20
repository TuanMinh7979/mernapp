import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import HTTP_STATUS from "http-status-codes";
import { FollowerCache } from "@service/redis/follower.cache";
import { UserCache } from "@service/redis/user.cache";

import mongoose from "mongoose";
import { IUserDocument } from "@user/interface/user.interface";
import { IFollowerData } from "../interfaces/follower.interface";
import { FollowerModel } from "../models/follower.schema";
import { socketIOFollowerObject } from "@socket/follower";
import { followQueue } from "@service/queue/follow.queue";
import { userService } from "@service/db/user.service";
import { followerService } from "@service/db/follower.service";
const followerCache: FollowerCache = new FollowerCache();
const userCache: UserCache = new UserCache();

export class Add {
  // * Params:
  // * Res:void
  public async follower(req: Request, res: Response): Promise<void> {
    const { followeeId } = req.params;
    // update count in cache
    //! Cache:
    // const updateFollowersCount: Promise<void> =
    //   followerCache.updateFolloweCountInCache(
    //     `${followeeId}`,
    //     "followersCount",
    //     1
    //   );
    // const updateFollowingCount: Promise<void> =
    //   followerCache.updateFolloweCountInCache(
    //     `${req.currentUser?.userId}`,
    //     "followingCount",
    //     1
    //   );

    // await Promise.all([updateFollowersCount, updateFollowingCount]);

    // const cacheFollowee: Promise<IUserDocument> = userCache.getUserFromCache(
    //   followeeId
    // ) as Promise<IUserDocument>;
    // const cacheFollower: Promise<IUserDocument> = userCache.getUserFromCache(
    //   `${req.currentUser?.userId}`
    // ) as Promise<IUserDocument>;

    // const response: [IUserDocument, IUserDocument] = await Promise.all([
    //   cacheFollower,
    //   cacheFollowee,
    // ]);
    const followObjectId: ObjectId = new ObjectId();
    // const addFollowerData: IFollowerData = Add.prototype.userData(response[0]);

    //  EXAM FOR addFollowerData
    // {
    //   avatarColor: "blue";
    //   followersCount: 2;
    //   followingCount: 2;
    //   profilePicture: "https://res.cloudinary.com/djnekmzdf/image/upload/v1690828320/64c7fa94bf260b6daf3f15fe";
    //   uId: "991254140832";
    //   username: "Nobita";
    //   _id: "64c7fa94bf260b6daf3f15fe";
    // }
    //send data to client using socket io
    //! Socket:
    // socketIOFollowerObject.emit("add follow", addFollowerData);
    // list  follower:
    // ! Cache
    // const addFollowerToCache: Promise<void> = followerCache.saveFollowerToCache(
    //   `follower:${req.currentUser?.userId}`,
    //   followeeId
    // );
    // // list following:
    // const addFollowingToCache: Promise<void> =
    //   followerCache.saveFollowerToCache(
    //     `following:${followeeId}`,
    //     `${req.currentUser?.userId}`
    //   );
    // await Promise.all([addFollowerToCache, addFollowingToCache]);
    //! Queue:
    // followQueue.addFollowJob("addFollowToDB", {
    //   keyOne: `${req.currentUser?.userId}`,
    //   keyTwo: followeeId,
    //   username: req.currentUser?.username,
    //   followDocumentId: followObjectId,
    // });

    // ! Service:
    await followerService.addFollowerToDB(
      req?.currentUser?.userId!,
      followeeId,
      req?.currentUser?.username!,
      followObjectId
    );

    //  ! Service:
    const myNewIdol = await userService.getUserById(followeeId);

    //! Socket:
    const myNewIdolData: IFollowerData = Add.prototype.userData(myNewIdol);
    socketIOFollowerObject.emit("add follow", myNewIdolData);

    res.status(HTTP_STATUS.OK).json({ message: "Following user now" });
  }

  private userData(user: IUserDocument): IFollowerData {
    return {
      _id: new mongoose.Types.ObjectId(user._id),
      username: user.username!,
      avatarColor: user.avatarColor!,
      postCount: user.postsCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profilePicture: user.profilePicture,
      uId: user.uId!,
    };
  }
}
