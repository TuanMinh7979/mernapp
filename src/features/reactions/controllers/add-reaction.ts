import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import HTTP_STATUS from "http-status-codes";
import { joiValidation } from "@global/decorators/joi-validation.decorators";

import { addReactionSchema } from "../schemes/reaction";
import {
  IReactionDocument,
  IReactionJob,
} from "../interfaces/reaction.interface";

import { reactionService } from "@service/db/reaction.service";

export class Add {
  // * Params:
  // * Res: void
  @joiValidation(addReactionSchema)
  public async reaction(req: Request, res: Response): Promise<void> {


    // *userTo : id of post creator
    const {
      userTo,
      postId,
      type,
      previousReaction,
      postReactions,
      profilePicture,
    } = req.body;
    const reactionObject: IReactionDocument = {
      _id: new ObjectId(),
      postId,
      type,
      avatarColor: req.currentUser!.avatarColor,
      username: req.currentUser!.username,
      profilePicture,
    } as IReactionDocument;

    const databaseReactionData: IReactionJob = {
      postId,
      userTo: userTo,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      type,
      previousReaction,
      reactionObject,
    };

    //  ! Service:
    await reactionService.addReactionDataToDB(databaseReactionData);
    res.status(HTTP_STATUS.OK).json({ message: "Reaction added successfully" });
  }
}
