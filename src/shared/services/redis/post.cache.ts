import { BaseCache } from "@service/redis/base.cache";
import Logger from "bunyan";
import { config } from "@root/config";
import { ServerError } from "@global/helpers/error-handler";
import {
  IPostDocument,
  ISavePostToCache,
} from "@root/features/post/interfaces/post.interface";
import { IReactions } from "@root/features/reactions/interfaces/reaction.interface";
import { Helpers } from "@global/helpers/helper";
import { RedisCommandRawReply } from "@redis/client/dist/lib/commands";
import { commandOptions } from "redis";
const log: Logger = config.createLogger("postCache");

export type PostCacheMultiType =
  | string
  | number
  | Buffer
  | RedisCommandRawReply[]
  | IPostDocument
  | IPostDocument[];

export class PostCache extends BaseCache {
  constructor() {
    super("postCache");
  }

  public async savePostToCache(data: ISavePostToCache): Promise<void> {
    const { key, currentUserId, uId, createdPost } = data;
    const {
      _id,
      userId,
      username,
      email,
      avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount,
      imgVersion,
      imgId,
      videoId,
      videoVersion,
      reactions,
      createdAt,
    } = createdPost;

    const dataToSave = {
      _id: `${_id}`,
      userId: `${userId}`,
      username: `${username}`,
      email: `${email}`,
      avatarColor: `${avatarColor}`,
      profilePicture: `${profilePicture}`,
      post: `${post}`,
      bgColor: `${bgColor}`,
      feelings: `${feelings}`,
      privacy: `${privacy}`,
      gifUrl: `${gifUrl}`,
      commentsCount: `${commentsCount}`,
      reactions: JSON.stringify(reactions),
      imgVersion: `${imgVersion}`,
      imgId: `${imgId}`,
      videoId: `${videoId}`,
      videoVersion: `${videoVersion}`,
      createdAt: `${createdAt}`,
    };

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const postCount: string[] = await this.client.HMGET(
        `users:${currentUserId}`,
        "postsCount"
      );
      console.log(postCount);
      const multi = this.client.multi();
      //add element to a sorted list with accordently scorce
      await this.client.ZADD("post", {
        score: parseInt(uId, 10),
        value: `${key}`,
      });
      for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
        multi.HSET(`posts:${key}`, `${itemKey}`, `${itemValue}`);
      }
      const count: number = parseInt(postCount[0], 10) + 1;
      //set a value of a property of a object
      multi.HSET(`users:${currentUserId}`, "postsCount", count);
      multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  public async getPostsFromCache(
    key: string,
    start: number,
    end: number
  ): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const reply: string[] = await this.client.ZRANGE(key, start, end);

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }
      const replies: PostCacheMultiType =
        (await multi.exec()) as unknown as PostCacheMultiType;
      const postReplies: IPostDocument[] = [];
      for (const post of replies as unknown as IPostDocument[]) {
        //  cast to real type from string
        post.commentsCount = Helpers.parseJson(
          `${post.commentsCount}`
        ) as number;
        post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(
          Helpers.parseJson(`${post.createdAt}`)
        ) as Date;
        postReplies.push(post);
      }

      return postReplies;
    } catch (e: any) {
      log.error(e);
      console.log("---------------", e?.message);
      throw new ServerError("Server error. Try again.");
    }
  }

  public async getTotalPostsInCache(): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count: number = await this.client.ZCARD("post");
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  // //only get post and its asscociated image with it
  public async getPostsWithImagesFromCache(
    key: string,
    start: number,
    end: number
  ): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const reply: string[] = await this.client.ZRANGE(key, start, end);
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }
      const replies: PostCacheMultiType =
        (await multi.exec()) as PostCacheMultiType;
      const postWithImages: IPostDocument[] = [];
      for (const post of replies as IPostDocument[]) {
        if ((post.imgId && post.imgVersion) || post.gifUrl) {
          post.commentsCount = Helpers.parseJson(
            `${post.commentsCount}`
          ) as number;
          post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
          post.createdAt = new Date(
            Helpers.parseJson(`${post.createdAt}`)
          ) as Date;
          postWithImages.push(post);
        }
      }
      return postWithImages;
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  // get user's post
  public async getUserPostsFromCache(
    key: string,
    uId: number
  ): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      // similar zrangebyscore post s1 s1
      const reply: string[] = await this.client.ZRANGEBYSCORE(key, uId, uId);
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const value of reply) {
        multi.HGETALL(`posts:${value}`);
      }
      const replies: PostCacheMultiType =
        (await multi.exec()) as PostCacheMultiType;
      const postReplies: IPostDocument[] = [];
      for (const post of replies as IPostDocument[]) {
        post.commentsCount = Helpers.parseJson(
          `${post.commentsCount}`
        ) as number;
        post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(
          Helpers.parseJson(`${post.createdAt}`)
        ) as Date;
        postReplies.push(post);
      }
      return postReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  public async getTotalUserPostsInCache(uId: number): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count: number = await this.client.ZCOUNT("post", uId, uId);
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  // ------------
  public async deletePostFromCache(
    key: string,
    currentUserId: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const postCount: string[] = await this.client.HMGET(
        `users:${currentUserId}`,
        "postsCount"
      );
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      // delete from sorted list
      multi.ZREM("post", `${key}`);
      // delete from posts 
      multi.DEL(`posts:${key}`);
      // multi.DEL(`comments:${key}`);
      // multi.DEL(`reactions:${key}`);
      const count: number = parseInt(postCount[0], 10) - 1;
      multi.HSET(`users:${currentUserId}`, "postsCount", count);
      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }
}
