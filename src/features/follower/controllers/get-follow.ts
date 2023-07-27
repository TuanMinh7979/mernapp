import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import HTTP_STATUS from "http-status-codes";
import mongoose from "mongoose";
import { FollowerCache } from "@service/redis/follower.cache";
import { IFollowerData } from "../interfaces/follower.interface";
import { followerService } from "@service/db/follower.service";

const followerCache: FollowerCache = new FollowerCache();

export class Get {
  // * get all  my idols
  //  * Params:
  //  * Res:
  public async userFollowing(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(
      req.currentUser!.userId
    );
    // const cachedFollowees: IFollowerData[] =
    //   await followerCache.getFollowersFromCache(
    //     `follower:${req.currentUser!.userId}`
    //   );
    const following: IFollowerData[] =
      // cachedFollowees.length
      //   ? cachedFollowees
      //   :
      await followerService.getFolloweeData(userObjectId);
    res.status(HTTP_STATUS.OK).json({ message: "All my idol", following });
  }
  // * get all  fans
  //  * Params:
  //  * Res:
  public async userFollowers(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(
      req.params.userId
    );
    // const cachedFollowers: IFollowerData[] =
    //   await followerCache.getFollowersFromCache(
    //     `following:${req.params.userId}`
    //   );
    const followers: IFollowerData[] =
      //cachedFollowers.length
      //   ? cachedFollowers
      //   :
      await followerService.getFollowerData(userObjectId);
    res.status(HTTP_STATUS.OK).json({ message: "All my fans", followers });
  }
}
