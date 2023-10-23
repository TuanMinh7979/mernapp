import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import HTTP_STATUS from "http-status-codes";

import mongoose from "mongoose";
import { IUserAuthDocument } from "@user/interface/user.interface";
import { IFollowerData } from "../interfaces/follower.interface";

import { socketIOFollowerObject } from "@socket/follower";

import { userService } from "@service/db/user.service";
import { followerService } from "@service/db/follower.service";

export class Add {
  // * Params:
  // * Res:void
  public async follower(req: Request, res: Response): Promise<void> {
    const { followeeId } = req.params;
    const followObjectId: ObjectId = new ObjectId();
    // ! Service:
    await followerService.addFollowerToDB(
      req?.currentUser?.userId!,
      followeeId,
      req?.currentUser?.username!,
      followObjectId
    );

    //  ! Service:
    const myNewIdol = await userService.getUserAuthByUserId(followeeId);

    //! Socket:
    const myNewIdolData: IFollowerData =
      Add.prototype.toFollowerData(myNewIdol);
    socketIOFollowerObject.emit("added follow", myNewIdolData);

    res.status(HTTP_STATUS.OK).json({ message: "Following user now" });
  }

  private toFollowerData(user: IUserAuthDocument): IFollowerData {
    return {
      _id: new mongoose.Types.ObjectId(user._id),
      username: user.username!,
      avatarColor: user.avatarColor!,
      postsCount: user.postsCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profilePicture: user.profilePicture,

    };
  }
}
