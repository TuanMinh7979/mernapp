import { Helpers } from "@global/helpers/helper";
import { INotificationDocument } from "@notification/interfaces/notification.inteface";
import { NotificationModel } from "@notification/models/notification.scheme";
import { IPostDocument } from "@post/interfaces/post.interface";
import { PostModel } from "@post/models/post.schema";
import {
  IQueryReaction,
  IReactionDocument,
  IReactionJob,
} from "@root/features/reactions/interfaces/reaction.interface";
import { ReactionModel } from "@root/features/reactions/models/reaction.shema";

import { socketIONotificationObject } from "@socket/notification";
import { IUserAuthDocument } from "@user/interface/user.interface";

import { omit } from "lodash";
import mongoose, { ObjectId } from "mongoose";
import { userService } from "./user.service";
import Logger from "bunyan";
import { config } from "@root/config";

const log: Logger = config.createLogger("ReactService");
class ReactionService {
  //   * Params:
  //   * reactionData
  //   * Res: IUserAuthDocument
  public async addReactionDataToDB(reactionData: IReactionJob): Promise<void> {
    const {
      postId,
      userTo,
      userFrom,
      username,
      type,
      previousReaction,
      reactionObject,
    } = reactionData;
    let updatedReactionObject: IReactionDocument =
      reactionObject as IReactionDocument;

    if (previousReaction) {
      // if update have to remove new Id from add-reaction.reaction
      updatedReactionObject = omit(reactionObject, ["_id"]);
    }

    // Add and Update (upsert: true)
    const updatedReaction: [
      IUserAuthDocument,
      IReactionDocument,
      IPostDocument
    ] = (await Promise.all([
      userService.getUserAuthByUserId(userTo!),
      ReactionModel.replaceOne(
        { postId, type: previousReaction, username },
        updatedReactionObject,
        { upsert: true }
      ),
      PostModel.findOneAndUpdate(
        { _id: postId, [`reactions.${previousReaction}`]: { $gt: 0 } },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1,
            [`reactions.${type}`]: 1,
          },
        },
        { new: true }
      ),
    ])) as unknown as [IUserAuthDocument, IReactionDocument, IPostDocument];

    // ! CMN NOTI:
    if (updatedReaction[0].notifications.reactions && userTo !== userFrom) {
      const notificationModel: INotificationDocument = new NotificationModel();
      const notifications = await notificationModel.insertNotification({
        userFrom: userFrom!,
        userTo: updatedReaction[0]._id as string,
        message: `${username} reacted to your post.`,
        notificationType: "reactions",
        entityId: new mongoose.Types.ObjectId(postId),
        createdItemId: new mongoose.Types.ObjectId(updatedReaction[1]._id!),
        createdAt: new Date(),
        comment: "",
        post: updatedReaction[2].post,
        imgId: updatedReaction[2].imgId!,
        imgVersion: updatedReaction[2].imgVersion!,
        gifUrl: updatedReaction[2].gifUrl!,
        reaction: type!,
      });
      // userTo is id of target user
      socketIONotificationObject
        .to(userTo as string)
        .emit("inserted notification", notifications, {
          userTo,
        });
    }
  }

  //   * Params:
  //   * reactionData
  //   * Res: void
  public async removeReactionDataFromDB(
    reactionData: IReactionJob
  ): Promise<void> {
    const { postId, previousReaction, username } = reactionData;
    await Promise.all([
      ReactionModel.deleteOne({ postId, type: previousReaction, username }),

      PostModel.updateOne(
        { _id: postId },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1,
          },
        },
        { new: true }
      ),
    ]);
  }

  //   * Params:
  //   * query: {postId}
  //   * sort
  //   * Res: [IReactionDocument[], len]
  public async getAllReactionsOfAPost(
    query: IQueryReaction,
    sort: Record<string, 1 | -1>
  ): Promise<[IReactionDocument[], number]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      { $match: query },
      { $sort: sort },
    ]);
    return [reactions, reactions.length];
  }
  // * get a reaction of a user on a post
  //   * Params:
  //   * postId:
  //   * username:
  //   * Res: [IReactionDocument[], len]
  public async getAReactionByAUserOfAPost(
    postId: string,
    username: string
  ): Promise<[IReactionDocument, number] | []> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      {
        $match: {
          postId: new mongoose.Types.ObjectId(postId),
          username: Helpers.firstLetterUppercase(username),
        },
      },
    ]);
    return reactions.length ? [reactions[0], 1] : [];
  }

  public async getAllReactionsByUsername(
    username: string
  ): Promise<IReactionDocument[]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      { $match: { username: Helpers.firstLetterUppercase(username) } },
    ]);

    return reactions;
  }
}

export const reactionService: ReactionService = new ReactionService();
