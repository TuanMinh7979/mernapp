import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import HTTP_STATUS from "http-status-codes";
import mongoose from "mongoose";

import { IFollowerData } from "../interfaces/follower.interface";
import { followerService } from "@service/db/follower.service";

export class Get {
  // * get all my idols
  //  * Params:
  //  * Res:
  public async userFollowing(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(
      req.currentUser!.userId
    );
    const following: IFollowerData[] = await followerService.getFolloweeData(
      userObjectId
    );    
    res.status(HTTP_STATUS.OK).json({ message: "All my idol", following });
  }
  // * get all  fans
  //  * Params:
  //  * Res:
  public async userFollowers(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(
      req.params.userId
    );
    const followers: IFollowerData[] = await followerService.getFollowerData(
      userObjectId
    );
    res.status(HTTP_STATUS.OK).json({ message: "All my fans", followers });
  }
}
