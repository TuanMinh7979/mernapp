import { reactionService } from './../../../shared/services/db/reaction.service';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';


import { IReactionJob } from '../interfaces/reaction.interface';




export class Remove {
   // * Params: 
  // * Res: void
  public async reaction(req: Request, res: Response): Promise<void> {
    const { postId, previousReaction, postReactions } = req.params;

    const databaseReactionData: IReactionJob = {
      postId,
      username: req.currentUser!.username ,
      previousReaction
    };
    // ! Service: 
    await reactionService.removeReactionDataFromDB(databaseReactionData);
    res.status(HTTP_STATUS.OK).json({ message: 'Reaction removed from post' });
  }
}