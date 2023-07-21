import { StringExpressionOperatorReturningArray } from "mongoose";
import { BaseCache } from "./base.cache";

import Logger from "bunyan";
import { config } from "@root/config";
import { ServerError } from "@global/helpers/error-handler";
import { Helpers } from "@global/helpers/helper";
import { ICommentDocument } from "@comment/interfaces/comment.interface";
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
}
