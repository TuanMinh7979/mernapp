import { ReactionModel } from "@root/features/reactions/models/reaction.shema";
import jwt from "jsonwebtoken";
import { IDecodedToken } from "@auth/interfaces/auth.interface";
import { userService } from "@service/db/user.service";
import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";

import { generateAccessToken } from "@root/shared/utils/generate-token-utils";

import { BadRequestError } from "@global/helpers/error-handler";

export class RefreshToken {
  public async read(req: Request, res: Response): Promise<void> {
    const requestRfToken = req.cookies.refreshtoken;

    if (!requestRfToken) {
      throw new BadRequestError(
        "Refresh Token is not available, login again please"
      );
    }
    let decoded;
    try {
      decoded = <IDecodedToken>(
        jwt.verify(requestRfToken, `${process.env.REFRESH_SECRET}`)
      );
      const existingUser = await userService.getUserAuthByUserId(
        decoded.userId
      );

      if (!existingUser) {
        throw new BadRequestError("This account does not exist.");
      }
      const access_token = generateAccessToken({
        userId: existingUser._id.toString(),
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor,
      });

      res
        .status(HTTP_STATUS.OK)
        .json({ token: access_token, user: existingUser });
    } catch (err: any) {
      res
        .clearCookie("refreshtoken")
        .status(400)
        .json({
          message: `Your refresh token has expired(over ${process.env.RF_TOKEN_EXP}) please login again`,
        });
    }
  }
}
