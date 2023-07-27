import { BaseCache } from "@service/redis/base.cache";
import Logger from "bunyan";
import { remove } from "lodash";
import mongoose from "mongoose";
import { config } from "@root/config";
import { ServerError } from "@global/helpers/error-handler";
import { UserCache } from "@service/redis/user.cache";
import { IFollowerData } from "@root/features/follower/interfaces/follower.interface";
import { IUserDocument } from "@user/interface/user.interface";
import { Helpers } from "@global/helpers/helper";
const log: Logger = config.createLogger("followersCache");
const userCache: UserCache = new UserCache();

export class FollowerCache extends BaseCache {
  constructor() {
    super("followersCache");
  }

  //*   Params:
  //*   key: id of follower
  //*   value: id of followee
  //*   Res:void
  public async saveFollowerToCache(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LPUSH(key, value);
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }
  //*   Params:
  //*   key:
  //*   value:
  //*   Res:void
  public async removeFollowFromCache(
    key: string,
    value: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LREM(key, 1, value);
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }
  //*   Params:
  //*   userId:
  //*   prop: followersCount || followingCount
  //*   value: new value
  //*   Res:void
  //* update users:key hash object property(followersCount, followingCount)
  public async updateFolloweCountInCache(
    userId: string,
    prop: string,
    value: number
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      //   increase
      await this.client.HINCRBY(`users:${userId}`, prop, value);
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  //*   Params:
  //  *key:
  //*   Res:
  // get from follwing list object
  public async getFollowersFromCache(key: string): Promise<IFollowerData[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(key, 0, -1);
      const list: IFollowerData[] = [];
      for (const item of response) {
        const user: IUserDocument = (await userCache.getUserFromCache(
          item
        )) as IUserDocument;
        const data: IFollowerData = {
          _id: new mongoose.Types.ObjectId(user._id),
          username: user.username!,
          avatarColor: user.avatarColor!,
          postCount: user.postsCount,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          profilePicture: user.profilePicture,
          uId: user.uId!,
          userProfile: user,
        };
        list.push(data);
      }
      return list;
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  //*   Params:
  //  *key:  key of users:key Hash Object
  //  *prop: block or blockBy property
  //  *value: value to add / remove in array block[]/blockBy[]
  //  *type: block | unblock
  //*   Res:
  public async updateBlockedUserPropInCache(
    key: string,
    prop: string,
    value: string,
    type: "block" | "unblock"
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response: string = (await this.client.HGET(
        `users:${key}`,
        prop
      )) as string;
      if (!response) return;
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      let blocked: string[] = Helpers.parseJson(response) as string[];
      if (type === "block") {
        blocked = [...blocked, value];
      } else {
        remove(blocked, (id: string) => id === value);
        blocked = [...blocked];
      }
      //  * update
      multi.HSET(`users:${key}`, `${prop}`, JSON.stringify(blocked));
      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }
}
