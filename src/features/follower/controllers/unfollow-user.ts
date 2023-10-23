import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";

import { followerService } from "@service/db/follower.service";
import { userService } from "@service/db/user.service";
import { socketIOFollowerObject } from "@socket/follower";
import { IUserAuthDocument } from "@user/interface/user.interface";
import mongoose from "mongoose";
import { IFollowerData } from "../interfaces/follower.interface";
export class Remove {
  //* Params:
  //* Res:
  public async remove(req: Request, res: Response): Promise<void> {
    const { followeeId, followerId } = req.params;

    // ! Service:
    await followerService.removeFollowerFromDB(followeeId, followerId);

    //  ! Service:
    const updatedIdol = await userService.getUserAuthByUserId(followeeId);
    socketIOFollowerObject.emit(
      "removed follow",
      Remove.prototype.toFollowerData(updatedIdol)
    );

    res.status(HTTP_STATUS.OK).json({ message: "Unfollowed user now" });
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
