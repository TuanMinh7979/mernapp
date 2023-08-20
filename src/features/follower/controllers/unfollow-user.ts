import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { FollowerCache } from '@service/redis/follower.cache';
import { followQueue } from '@service/queue/follow.queue';
import { followerService } from '@service/db/follower.service';

const followerCache: FollowerCache = new FollowerCache();

export class Remove {
  //* Params:
  //* Res:
  public async follower(req: Request, res: Response): Promise<void> {
    const { followeeId, followerId } = req.params;
    // const removeFollowerFromCache: Promise<void> = followerCache.removeFollowFromCache(
    //   `following:${followeeId}`,
    //   `${followerId}`
    // );
    // ! Cache:
    // const removeFolloweeFromCache: Promise<void> = followerCache.removeFollowFromCache(`follower:${followerId}`, followeeId);

    // const followersCount: Promise<void> = followerCache.updateFolloweCountInCache(`${followeeId}`, 'followersCount', -1);
    // const followeeCount: Promise<void> = followerCache.updateFolloweCountInCache(`${followerId}`, 'followingCount', -1);
    // await Promise.all([removeFollowerFromCache, removeFolloweeFromCache, followersCount, followeeCount]);

    // ! Queue:
    // followQueue.addFollowJob('removeFollowFromDB', {
    //   keyOne: `${followeeId}`,
    //   keyTwo: `${followerId}`
    // });

    
    // ! Service:
    await followerService.removeFollowerFromDB(followeeId, followerId);
    res.status(HTTP_STATUS.OK).json({ message: 'Unfollowed user now' });
  }
}