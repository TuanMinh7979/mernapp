import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { ReactionCache } from '@service/redis/reaction.cache';
import { IReactionJob } from '../interfaces/reaction.interface';
import { reactionQueue } from '@service/queue/reaction.queue';


const reactionCache: ReactionCache = new ReactionCache();

export class Remove {
  public async reaction(req: Request, res: Response): Promise<void> {
    const { postId, previousReaction, postReactions } = req.params;
    //clear react in cache
    await reactionCache.removePostReactionFromCache(postId, `${req.currentUser!.username}`, JSON.parse(postReactions));
    //remove in DB
    const databaseReactionData: IReactionJob = {
      postId,
      username: req.currentUser!.username ,
      previousReaction
    };
    reactionQueue.addReactionJob('removeReactionFromDB', databaseReactionData);
    res.status(HTTP_STATUS.OK).json({ message: 'Reaction removed from post' });
  }
}