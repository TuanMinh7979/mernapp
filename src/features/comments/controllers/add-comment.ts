import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { ICommentDocument, ICommentJob } from '@comment/interfaces/comment.interface';
import { CommentCache } from '@service/redis/comment.cache';
import { commentQueue } from '@service/queue/comment.queue';
import {addCommentSchema} from "@comment/schemes/comment";

const commentCache: CommentCache = new CommentCache();

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
        createdAt: new Date()
    } as unknown as ICommentDocument;
    //! Cache: 
    await commentCache.savePostCommentToCache(postId, JSON.stringify(commentData));

    const databaseCommentData: ICommentJob = {
      postId,
      userTo,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      comment: commentData
    };
    //! Queue:
    commentQueue.addCommentJob('addCommentToDB', databaseCommentData);
    res.status(HTTP_STATUS.OK).json({ message: 'Comment created successfully' });
  }
}