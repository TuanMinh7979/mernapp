import {
  ICommentDocument,
  ICommentJob,
  ICommentNameList,
  IQueryComment,
} from "@comment/interfaces/comment.interface";
import { CommentsModel } from "@comment/models/comment.schema";
import { PostModel } from "@post/models/post.schema";
import { UserCache } from "@service/redis/user.cache";

const userCache: UserCache = new UserCache();
// * Params:
// * Res: void
class CommentService {
  public async addCommentToDB(commentData: ICommentJob): Promise<void> {
    const { postId, userTo, userFrom, comment, username } = commentData;
    const comments: Promise<ICommentDocument> = CommentsModel.create(comment);
    const post = PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { commentsCount: 1 },
      },
      { new: true }
    );

    //! Cache:
    const user = userCache.getUserFromCache(userTo);
    const response = await Promise.all([comments, post, user]);
    //send comment notification
  }
  // * Params:
  // * Res: ICommentDocument of a post
  public async getPostComments(
    query: IQueryComment,
    sort: Record<string, 1 | -1>
  ): Promise<ICommentDocument[]> {
    const comments: ICommentDocument[] = await CommentsModel.aggregate([
      { $match: query },
      { $sort: sort },
    ]);
    return comments;
  }
  // * Params:
  // * Res:ICommentNameList[]
  public async getPostCommentUsernames(
    query: IQueryComment,
    sort: Record<string, 1 | -1>
  ): Promise<ICommentNameList[]> {
    
    const commentUserNameListOfAPost: ICommentNameList[] =
      await CommentsModel.aggregate([
        { $match: query },
        { $sort: sort },
        {
          $group: {
            // group by all ,no group
            _id: null,
            names: { $addToSet: "$username" },
            // count: { $sum: 1 },
            count: { $sum: 1 }
          },
        },
        { $project: { _id: 0 } },
      ]);
      console.log(commentUserNameListOfAPost);
      
    return commentUserNameListOfAPost;
  }
}

export const commentService: CommentService = new CommentService();
