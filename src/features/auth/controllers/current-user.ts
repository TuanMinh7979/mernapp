import { userService } from "@service/db/user.service";
import { UserCache } from "@service/redis/user.cache";
import { IUserDocument } from "@user/interface/user.interface";
import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
const userCache = new UserCache();
export class CurrentUser {
  public async read(req: Request, res: Response): Promise<void> {
    let isUser = false;
    let token = null;
    let user = null;
    // ! Cache:
    // const cachedUser: IUserDocument = (await userCache.getUserFromCache(
    //   `${req.currentUser?.userId}`
    // )) as IUserDocument;

    // const existingUser = cachedUser
    //   ? cachedUser
    //   : await userService.getUserById(req.currentUser?.userId as string);
    // ! Service:
    const existingUser = await userService.getUserById(
      req.currentUser?.userId as string
    );
    if (Object.keys(existingUser).length) {
      isUser = true;
      token = req.session?.jwt;
      user = existingUser;
    }
    res.status(HTTP_STATUS.OK).json({ token, isUser, user });
  }
}
