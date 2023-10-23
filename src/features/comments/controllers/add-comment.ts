import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import HTTP_STATUS from "http-status-codes";
import { joiValidation } from "@global/decorators/joi-validation.decorators";
import {
  ICommentDocument,
  ICommentJob,
} from "@comment/interfaces/comment.interface";

import { addCommentSchema } from "@comment/schemes/comment";
import { commentService } from "@service/db/comment.service";


export class Add {
  @joiValidation(addCommentSchema)
  //* Params:
  //* Res:
  public async comment(req: Request, res: Response): Promise<void> {
    const { userTo, postId, profilePicture, comment } = req.body;

    const commentObjectId: ObjectId = new ObjectId();
    const commentData: ICommentDocument = {
      _id: commentObjectId,
      postId,
      username: `${req.currentUser?.username}`,
      avatarColor: `${req.currentUser?.avatarColor}`,
      profilePicture,
      comment,
      createdAt: new Date(),
    } as unknown as ICommentDocument;


    const databaseCommentData: ICommentJob = {
      postId,
      userTo,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      comment: commentData,
    };


    // ! Service:
    await commentService.addCommentToDB(databaseCommentData);
    res
      .status(HTTP_STATUS.OK)
      .json({ message: "Comment created successfully" });
  }
}
