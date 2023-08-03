import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
import { UserCache } from "@service/redis/user.cache";

import { joiValidation } from "@global/decorators/joi-validation.decorators";
import { basicInfoSchema, socialLinksSchema } from "@user/schemes/info";
import { userQueue } from "@service/queue/user.queue";

const userCache: UserCache = new UserCache();

export class Edit {
  // *Params:
  // *Res:
  @joiValidation(basicInfoSchema)
  public async info(req: Request, res: Response): Promise<void> {
    // for (const [key, value] of Object.entries(req.body)) {
    //   // ! Cache
    //   await userCache.updateSingleUserItemInCache(
    //     `${req.currentUser!.userId}`,
    //     key,
    //     `${value}`
    //   );
    // }
    // ! Queue
    userQueue.addUserToDbJob("updateBasicInfoInDB", {
      key: `${req.currentUser!.userId}`,
      value: req.body,
    });
    res.status(HTTP_STATUS.OK).json({ message: "Updated successfully" });
  }
  // *Params:
  // *Res:
  @joiValidation(socialLinksSchema)
  public async social(req: Request, res: Response): Promise<void> {
    // ! Cache
    // await userCache.updateSingleUserItemInCache(
    //   `${req.currentUser!.userId}`,
    //   "social",
    //   req.body
    // );
    //  ! Queue
    userQueue.addUserToDbJob("updateSocialLinksInDB", {
      key: `${req.currentUser!.userId}`,
      value: req.body,
    });
    res.status(HTTP_STATUS.OK).json({ message: "Updated successfully" });
  }
}
