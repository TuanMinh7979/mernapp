import { BaseCache } from "@service/redis/base.cache";
import Logger from "bunyan";
import { find } from "lodash";
import { config } from "@root/config";
import { ServerError } from "@global/helpers/error-handler";
import {
  IReactionDocument,
  IReactions,
} from "@root/features/reactions/interfaces/reaction.interface";
import { Helpers } from "@global/helpers/helper";

const log: Logger = config.createLogger("reactionsCache");

export class ReactionCache extends BaseCache {
  constructor() {
    super("reactionsCache");
  }

  // *param:
  // *key: postId
  public async savePostReactionToCache(
    key: string,
    reaction: IReactionDocument,
    postReactions: IReactions,
    type: string,
    previousReaction: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      if (previousReaction) {
        this.removePostReactionFromCache(key, reaction.username, postReactions);
      }

      if (type) {
        // *if is a new reaction
        await this.client.LPUSH(`reactions:${key}`, JSON.stringify(reaction));
        await this.client.HSET(
          `posts:${key}`,
          "reactions",
          JSON.stringify(postReactions)
        );
      }
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  // *params: 
  // * -key: postId 
  public async removePostReactionFromCache(
    key: string,
    username: string,
    postReactions: IReactions
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      //   get all use 0-1
      const response: string[] = await this.client.LRANGE(
        `reactions:${key}`,
        0,
        -1
      );
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();


      const userPreviousReaction: IReactionDocument = this.getPreviousReaction(
        response,
        username
      ) as IReactionDocument;
      console.log("user previous reaction: ", userPreviousReaction);
      
    

      multi.LREM(`reactions:${key}`, 1, JSON.stringify(userPreviousReaction));
      await multi.exec();

      await this.client.HSET(
        `posts:${key}`,
        "reactions",
        JSON.stringify(postReactions)
      );
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }

    public async getReactionsFromCache(postId: string): Promise<[IReactionDocument[], number]> {
      try {
        if (!this.client.isOpen) {
          await this.client.connect();
        }
        const reactionsCount: number = await this.client.LLEN(`reactions:${postId}`);
        const response: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
        const list: IReactionDocument[] = [];
        for (const item of response) {
          list.push(Helpers.parseJson(item));
        }
        return response.length ? [list, reactionsCount] : [[], 0];
      } catch (error) {
        log.error(error);
        throw new ServerError('Server error. Try again.');
      }
    }

    public async getSingleReactionByUsernameFromCache(postId: string, username: string): Promise<[IReactionDocument, number] | []> {
      try {
        if (!this.client.isOpen) {
          await this.client.connect();
        }
        const response: string[] = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
        const list: IReactionDocument[] = [];
        for (const item of response) {
          list.push(Helpers.parseJson(item));
        }
        const result: IReactionDocument = find(list, (listItem: IReactionDocument) => {
          return listItem?.postId === postId && listItem?.username === username;
        }) as IReactionDocument;

        return result ? [result, 1] : [];
      } catch (error) {
        log.error(error);
        throw new ServerError('Server error. Try again.');
      }
    }

  // * params:
  // * -response:list reaction from redis( of a post)
  // * -username: reaction creator
  private getPreviousReaction(
    response: string[],
    username: string
  ): IReactionDocument | undefined {
    const list: IReactionDocument[] = [];

    for (const item of response) {
        console.log("item", item, typeof(item));
      list.push(Helpers.parseJson(item) );
    }
    
    return find(list, (listItem: IReactionDocument) => {
    

      return listItem.username === username;
    });
  }
}
