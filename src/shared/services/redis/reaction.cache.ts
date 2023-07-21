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

  //   * Params:
  // *key:  id of post docuemnt in mongoose = key of posts Hash object = new key of reactions List Object(a list have a key is post_id)
  // *reaction:data of reaction
  // *type:value of reaction(love, happy , sad) for create new or update
  //  * previousReaction: value of previous reaction(love, happy , sad) //remove if gived
  //   * Res: void
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
        // if exist old reaction
        this.removePostReactionFromCache(key, reaction.username, postReactions);
      }

      if (type) {
        // * push new reaction to reactions:key List Object
        await this.client.LPUSH(`reactions:${key}`, JSON.stringify(reaction));
        // * update new reaction property of posts:key Hash Object
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

  //   * Params:
  // *key: is id and key of reactions:key List Object
  // *username: username property in a reaction string element in reactions List Object
  // *type:value of reaction(love, happy , sad) for create new or update
  //  * previousReaction: new updated IReaction is going to be after removing prev reaction
  //   * Res: void
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
      // * LRANGE like multi HGETALL cmd with hash object
      const response: string[] = await this.client.LRANGE(
        `reactions:${key}`,
        0,
        -1
      );
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      const preReactionByUserName: IReactionDocument =
        this.getPreviousReactionByUserNameOfAPost(
          response,
          username
        ) as IReactionDocument;

      // * remove a reaction element from reactions:key List Object
      multi.LREM(`reactions:${key}`, 1, JSON.stringify(preReactionByUserName));
      await multi.exec();
      // * set new updated value of reaction property to posts:key Hash Object
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
  //   * Params:
  // *postId:  is reactions:key List Object
  //   * Res: [IReactionDocument[], len]
  public async getReactionsFromCache(
    postId: string
  ): Promise<[IReactionDocument[], number]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      //* get len of reactions:key List Object use LLEN
      const reactionsCount: number = await this.client.LLEN(
        `reactions:${postId}`
      );
      //* get all element(type IReactionDocument) of reactions:key List Object use LRANGE
      const response: string[] = await this.client.LRANGE(
        `reactions:${postId}`,
        0,
        -1
      );
      const list: IReactionDocument[] = [];
      for (const item of response) {
        list.push(Helpers.parseJson(item));
      }
      return response.length ? [list, reactionsCount] : [[], 0];
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  // * Params:
  // *postId:  is reactions:key List ObjectpostId
  // *username: reaction creator of reactions:key List ObjectpostId's element will be getted
  // * Res:[IReactionDocument, len] find in List reaction of a post by a username=> return only 1 record=> use find
  public async getSingleReactionByUsernameFromCache(
    postId: string,
    username: string
  ): Promise<[IReactionDocument, number] | []> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      // * LRANGE like multi HGETALL cmd with hash object
      const response: string[] = await this.client.LRANGE(
        `reactions:${postId}`,
        0,
        -1
      );
      const list: IReactionDocument[] = [];
      for (const item of response) {
        list.push(Helpers.parseJson(item));
      }
      const result: IReactionDocument = find(
        list,
        (listItem: IReactionDocument) => {
          return listItem?.postId === postId && listItem?.username === username;
        }
      ) as IReactionDocument;

      return result ? [result, 1] : [];
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }

  // private function
  // * Params: 
  // *reactionsListObject: a reactions:key List Object of a post
  // * username: username of creator to filter 
  //   * Res: IReactionDocument:find in List reaction of a post by a username=> return only 1 record=> use find
  private getPreviousReactionByUserNameOfAPost(
    reactionsListObject: string[],
    username: string
  ): IReactionDocument | undefined {
    const list: IReactionDocument[] = [];

    for (const item of reactionsListObject) {
      list.push(Helpers.parseJson(item));
    }

    return list.find((listItem: IReactionDocument) => {
      return listItem.username === username;
    });
  }
}
