import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
import {
  ICommentDocument,
  ICommentNameList,
  IQueryComment,
} from "@comment/interfaces/comment.interface";
import { CommentCache } from "@service/redis/comment.cache";
import { commentService } from "@service/db/comment.service";
import mongoose, { ObjectId, Types } from "mongoose";

const commentCache: CommentCache = new CommentCache();

export class Get {
  //* Params:
  //* Res:
  public async comments(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    //  ! Cache:
    // const cachedComments: ICommentDocument[] =
    //   await commentCache.getCommentsFromCache(postId);

    // const comments: ICommentDocument[] = cachedComments.length
    //   ? cachedComments
    //   : await commentService.getPostComments(
    //       { postId: new mongoose.Types.ObjectId(postId) },
    //       { createdAt: -1 }
    //     );

    //  ! Service:

    const comments: ICommentDocument[] = await commentService.getPostComments(
      { postId: new mongoose.Types.ObjectId(postId) },
      { createdAt: -1 }
    );

    res.status(HTTP_STATUS.OK).json({ message: "Post comments", comments });
  }

  public async commentsNamesFromCache(
    req: Request,
    res: Response
  ): Promise<void> {
    const { postId } = req.params;
    // const cachedCommentsNames: ICommentNameList[] =
    //   await commentCache.getUserNamesOfACommentFromCache(postId);
    // const commentsNames: ICommentNameList[]
    //  = cachedCommentsNames.length
    //   ? cachedCommentsNames
    //   : await commentService.getPostCommentUsernames({ postId: new mongoose.Schema.Types.ObjectId(postId) }, { createdAt: -1 });
    // ! Service:
    const commentsNames: ICommentNameList[] =
      await commentService.getPostCommentUsernames(
        { postId: new mongoose.Types.ObjectId(postId) },
        { createdAt: -1 }
      );

    res.status(HTTP_STATUS.OK).json({
      message: "Post comments names",
      comments: commentsNames.length ? commentsNames[0] : [],
    });
  }

  public async singleComment(req: Request, res: Response): Promise<void> {
    const { postId, commentId } = req.params;
    //  ! Cache:
    // const cachedComments: ICommentDocument[] =
    //   await commentCache.getACommentFromCache(postId, commentId);
    // const comments: ICommentDocument[] = cachedComments.length
    //   ? cachedComments
    //   : await commentService.getPostComments(
    //       { _id: new mongoose.Types.ObjectId(commentId) },
    //       { createdAt: -1 }
    //     );
    //  ! Service :
    const comments: ICommentDocument[] = await commentService.getPostComments(
      { _id: new mongoose.Types.ObjectId(commentId) },
      { createdAt: -1 }
    );

    res.status(HTTP_STATUS.OK).json({
      message: "Single comment",
      comments: comments.length ? comments[0] : [],
    });
  }
}
