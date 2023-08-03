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
  //   * Params:
  // *ISavePostToCache{
  //* key: ObjectId | string; = id of post = key of post sortedSet and posts:key Hash Object in redis
  //* currentUserId: string; = logged user id
  //* uId: string; = logged user uId
  //*createdPost: IPostDocument; = data of post
  //*}
  //   * Res: void
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
      //*  add element to a post sorted list with accordently score
      await this.client.ZADD("post", {
        score: parseInt(uId, 10),
        value: `${key}`,
      });
      for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
        multi.HSET(`posts:${key}`, `${itemKey}`, `${itemValue}`);
      }
      const count: number = parseInt(postCount[0], 10) + 1;
      // * update postsCount property of users:key Hash Object
      multi.HSET(`users:${currentUserId}`, "postsCount", count);
      multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  //   * Params:
  //* key: ObjectId | string; = id of post = key of post sortedSet and posts:key Hash Object in redis
  //* start, end : index in redis sorted set
  //   * Res: IPostDocument[]
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
      const resultArrayOfAllHGetAll: PostCacheMultiType =
        (await multi.exec()) as unknown as PostCacheMultiType;
      log.info(resultArrayOfAllHGetAll);
      const postDocuments: IPostDocument[] = [];
      for (const post of resultArrayOfAllHGetAll as unknown as IPostDocument[]) {
        //  cast to real type from string
        post.commentsCount = Helpers.parseJson(
          `${post.commentsCount}`
        ) as number;
        post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(
          Helpers.parseJson(`${post.createdAt}`)
        ) as Date;
        postDocuments.push(post);
      }

      return postDocuments;
    } catch (e: any) {
      log.error(e);
      throw new ServerError("Server error. Try again.");
    }
  }

  //   * Params:
  //   * Res: number
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
  //   * Params:
  //* key: ObjectId | string; = id of post = key of post sortedSet and posts:key Hash Object in redis
  //* start, end : index in redis sorted set
  //   * Res: IPostDocument[]
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
        // * get a posts:key Hash Object as string
        multi.HGETALL(`posts:${value}`);
      }
      const resultArrayOfAllHGetAll: PostCacheMultiType =
        (await multi.exec()) as PostCacheMultiType;
      const postWithImages: IPostDocument[] = [];
      for (const post of resultArrayOfAllHGetAll as IPostDocument[]) {
        if ((post.imgId && post.imgVersion) || post.gifUrl) {
          // * if post is imaging post
          // parse string to js type
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

  //   * Params:
  //* key: ObjectId | string; = id of post = key of post sortedSet and posts:key Hash Object in redis
  //   * Res: void
  public async deletePostFromCache(
    key: string,
    currentUserId: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      //* get postsCount from users:key HashObject
      const postCount: string[] = await this.client.HMGET(
        `users:${currentUserId}`,
        "postsCount"
      );
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      // delete from sorted list post
      //* ZREM is remove from post sorted set by value (a key)
      multi.ZREM("post", `${key}`);
      // delete from  posts
      multi.DEL(`posts:${key}`);
      // multi.DEL(`comments:${key}`);
      // multi.DEL(`reactions:${key}`);
      const count: number = parseInt(postCount[0]) - 1;
      // * update postsCount property of users:key hash object
      multi.HSET(`users:${currentUserId}`, "postsCount", count);
      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  //   * Params:
  //* key: ObjectId | string; = id of post = key of post sortedSet and posts:key Hash Object in redis
  //* updatedPost:IPostDocument: data to update
  //   * Res: IPostDocument: updated post document in cache
  public async updatePostInCache(
    key: string,
    updatedPost: IPostDocument
  ): Promise<IPostDocument> {
    const {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion,
      imgId,
      videoId,
      videoVersion,
      profilePicture,
    } = updatedPost;
    const dataToSave = {
      post: `${post}`,
      bgColor: `${bgColor}`,
      feelings: `${feelings}`,
      privacy: `${privacy}`,
      gifUrl: `${gifUrl}`,
      videoId: `${videoId}`,
      videoVersion: `${videoVersion}`,
      profilePicture: `${profilePicture}`,
      imgVersion: `${imgVersion}`,
      imgId: `${imgId}`,
    };

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
        // * set some properties are changed to posts:key hash object
        await this.client.HSET(`posts:${key}`, `${itemKey}`, `${itemValue}`);
      }
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.HGETALL(`posts:${key}`);
      const resultArrayOfAllHGetAll: PostCacheMultiType =
        (await multi.exec()) as PostCacheMultiType;

      const postReply = resultArrayOfAllHGetAll as IPostDocument;
      postReply.commentsCount = Helpers.parseJson(
        `${postReply.commentsCount}`
      ) as number;
      postReply.reactions = Helpers.parseJson(
        `${postReply.reactions}`
      ) as IReactions;
      postReply.createdAt = new Date(
        Helpers.parseJson(`${postReply.createdAt}`)
      ) as Date;

      return postReply;
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  //   * Params:
  //* uId: ObjectId | string id of user
  //* key: 'post'

  //   * Res: IPostDocument[]
  public async getUserPostsFromCache(
    key: string,
    uId: number
  ): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const reply: string[] = await this.client.ZRANGE(key, uId, uId, {
        REV: true,
        BY: "SCORE",
      });
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
}
