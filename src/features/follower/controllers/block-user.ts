import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
import { FollowerCache } from "@service/redis/follower.cache";
import { blockedUserQueue } from "@service/queue/block.queue";

const followerCache: FollowerCache = new FollowerCache();

export class BlockUser {
  //* Params :
  //* Res: void
  public async block(req: Request, res: Response): Promise<void> {
    const { otherId } = req.params;
    // ! Cache:
    BlockUser.prototype.updateBlockedInCache(
      otherId,
      req.currentUser!.userId,
      "block"
    );
    blockedUserQueue.addBlockedUserJob("addBlockedUserToDB", {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${otherId}`,
      type: "block",
    });
    res.status(HTTP_STATUS.OK).json({ message: "User blocked" });
  }
  //* Params :
  //* Res: void
  public async unblock(req: Request, res: Response): Promise<void> {
    const { otherId } = req.params;
    // ! Cache:
    BlockUser.prototype.updateBlockedInCache(
      otherId,
      req.currentUser!.userId,
      "unblock"
    );
    blockedUserQueue.addBlockedUserJob("removeBlockedUserFromDB", {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${otherId}`,
      type: "unblock",
    });
    res.status(HTTP_STATUS.OK).json({ message: "User unblocked" });
  }
  //   private function to update cache
  //* Params :
  //* Res: void
  private async updateBlockedInCache(
    otherId: string,
    userId: string,
    type: "block" | "unblock"
  ): Promise<void> {
    const blocked: Promise<void> = followerCache.updateBlockedUserPropInCache(
      `${userId}`,
      "blocked",
      `${otherId}`,
      type
    );
    const blockedBy: Promise<void> = followerCache.updateBlockedUserPropInCache(
      `${otherId}`,
      "blockedBy",
      `${userId}`,
      type
    );
    await Promise.all([blocked, blockedBy]);
  }
}
