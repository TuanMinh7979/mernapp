import { StringExpressionOperatorReturningArray } from "mongoose";
import { BaseCache } from "./base.cache";

import Logger from "bunyan";
import { config } from "@root/config";
import { ServerError } from "@global/helpers/error-handler";
import { Helpers } from "@global/helpers/helper";
import {
  ICommentDocument,
  ICommentNameList,
} from "@comment/interfaces/comment.interface";
const log: Logger = config.createLogger("commentsCache");
export class CommentCache extends BaseCache {
  constructor() {
    super("commentCache");
  }
  //   * Params: postId(postId want comment to), value(text of comment)
  //   * Res: void
  public async savePostCommentToCache(
    postId: string,
    value: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LPUSH(`comments:${postId}`, value);
      //get comment cnt from cache
      const commentCount: string[] = await this.client.HMGET(
        `posts:${postId}`,
        "commentsCount"
      );
      let count: number = Helpers.parseJson(commentCount[0]) as number;
      count += 1;
      await this.client.HSET(`posts:${postId}`, "commmentsCount", `${count}`);
    } catch (e) {
      log.error(e);
      throw new ServerError("Server error, try again");
    }
  }

  //   * Params: postId
  //   * Res:comments:key List Object of a post in cache
  public async getCommentsFromCache(
    postId: string
  ): Promise<ICommentDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      //   get all comments of a post
      //LRANGE 0 -1  user to get all
      const reply: string[] = await this.client.LRANGE(
        `comments:${postId}`,
        0,
        -1
      );
      const list: ICommentDocument[] = [];
      for (const item of reply) {
        list.push(Helpers.parseJson(item));
      }
      return list;
    } catch (e) {
      log.error(e);
      throw new ServerError("Server error, try again");
    }
  }

  //   * Params: postId
  //   * Res:ICommentNameList[] but actual only element
  public async getUserNamesOfACommentFromCache(
    postId: string
  ): Promise<ICommentNameList[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const commentsCount: number = await this.client.LLEN(
        `comments:${postId}`
      );
      const comments: string[] = await this.client.LRANGE(
        `comments:${postId}`,
        0,
        -1
      );
      const list: string[] = [];

      for (const item of comments) {
        const comment: ICommentDocument = Helpers.parseJson(
          item
        ) as ICommentDocument;
        list.push(comment.username);
      }
      const aCommentNameList: ICommentNameList = {
        count: commentsCount,
        names: list,
      };
      return [aCommentNameList];
    } catch (e) {
      log.error(e);
      throw new ServerError("Server error, try again");
    }
  }

  // * Params:
  // * postId
  // * commentId
  //   * Res:ICommentNameList[] but actual only element
  public async getACommentFromCache(
    postId: string,
    commentId: string
  ): Promise<ICommentDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const comments: string[] = await this.client.LRANGE(
        `comments:${postId}`,
        0,
        -1
      );
      const list: ICommentDocument[] = [];
      for (const item of comments) {
        list.push(Helpers.parseJson(item));
      }
      const result: ICommentDocument = list.find(
        (listItem: ICommentDocument) => listItem._id === commentId
      ) as ICommentDocument;

      return [result];
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }
}
