import  jwt  from "jsonwebtoken";

import { IDecodedToken } from "@auth/interfaces/auth.interface";
import { userService } from "@service/db/user.service";
import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";

export class CurrentUser {
  public async read(req: Request, res: Response): Promise<void> {
    try {
      const existingUser = await userService.getUserAuthByUserId(
        req.currentUser!.userId
      );

      if (!existingUser) {
        res.status(400).json({ message: "This account does not exist." });
        return;
      }

      let decoded = <IDecodedToken>(
        jwt.verify(req.cookies.refreshtoken, `${process.env.REFRESH_SECRET}`)
      );

      res
        .status(HTTP_STATUS.OK)
        .json({ user: { ...existingUser, rfTokenExp: decoded.exp } });
      return;
    } catch (err: any) {
      res.status(500).json({
        message: "Error when get data of user",
      });
      return;
    }
  }
}
