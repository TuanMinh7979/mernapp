import {
  ICommentDocument,
  ICommentJob,
  ICommentNameList,
  IQueryComment,
} from "@comment/interfaces/comment.interface";
import { CommentsModel } from "@comment/models/comment.schema";
import {
  INotification,
  INotificationDocument,
  INotificationTemplate,
} from "@notification/interfaces/notification.inteface";
import { NotificationModel } from "@notification/models/notification.scheme";
import { PostModel } from "@post/models/post.schema";
import { notificationTemplate } from "@service/emails/template/notifications/notification-template";
import { emailQueue } from "@service/queue/email.queue";
import { UserCache } from "@service/redis/user.cache";
import { socketIONotificationObject } from "@socket/notification";
import mongoose from "mongoose";
import { userService } from "./user.service";

const userCache: UserCache = new UserCache();
// * Params:
// * username: is name of user who comment to the post
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

    // ! Cache:
    // const user = userCache.getUserFromCache(userTo);
    const targetUser = userService.getUserById(userTo);

    const response = await Promise.all([comments, post, targetUser]);
    // ! CMN NOTI:
    if (response[2]?.notifications.comments && userFrom !== userTo) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notifications = await notificationModel.insertNotification({
        userFrom,
        userTo: response[2]._id as string,
        message: `${username} commented on your post`,
        notificationType: "comment",
        entityId: new mongoose.Types.ObjectId(postId),
        createdItemId: new mongoose.Types.ObjectId(response[0]._id),
        createdAt: new Date(),
        comment: comment.comment,
        post: response[1]?.post!,
        imgId: response[1]?.imgId!,
        imgVersion: response[1]?.imgVersion!,
        gifUrl: response[1]?.gifUrl!,
        reaction: "",
      });

      //send to client with socketIO
      // ! Socket:
      socketIONotificationObject.emit("insert notification", notifications, {
        userTo,
      });
      //send to emailQueue
      //  ! Email:
      // const templateParams: INotificationTemplate = {
      //   username: response[2].username!, // email of poster
      //   message: `${username} commented on your post`,
      //   header: "Notification of new comment",
      // };

      // const template: string =
      //   notificationTemplate.notificationMessageTemplate(templateParams);
 

      // emailQueue.addEmailJob("commentNotiEmail", {
      //   receiverEmail: response[2].email!,
      //   template,
      //   subject: "Comment Notification ",
      // });
    }
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
            _id: null,
            names: { $addToSet: "$username" },
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0 } },
      ]);
    console.log(commentUserNameListOfAPost);

    return commentUserNameListOfAPost;
  }
}

export const commentService: CommentService = new CommentService();
