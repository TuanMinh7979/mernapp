import { BaseCache } from "@service/redis/base.cache";
import Logger from "bunyan";
import { remove } from "lodash";
import mongoose from "mongoose";
import { config } from "@root/config";
import { ServerError } from "@global/helpers/error-handler";
import { UserCache } from "@service/redis/user.cache";
import { IFollowerData } from "@root/features/follower/interfaces/follower.interface";
import { IUserDocument } from "@user/interface/user.interface";
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
}
