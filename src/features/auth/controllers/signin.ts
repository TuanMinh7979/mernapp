import { ObjectId } from "mongodb";
import { Request, Response } from "express";
import { joiValidation } from "@global/decorators/joi-validation.decorators";
import { authService } from "@service/db/auth.service";
import { IAuthDocument } from "@auth/interfaces/auth.interface";
import { BadRequestError } from "@global/helpers/error-handler";

import HTTP_STATUS from "http-status-codes";

import { IUserAuthDocument } from "@user/interface/user.interface";

import { loginSchema } from "@auth/schemes/signin";
import { userService } from "@service/db/user.service";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@root/shared/utils/generate-token-utils";

export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    // ! 1. check exist authModel by username
    const existAuth: IAuthDocument = await authService.getAuthByUsername(
      username
    );
    if (!existAuth) {
      throw new BadRequestError("Invalid credentials");
    }
    // ! 2. compare password
    const passwordsMatch: boolean = await existAuth.comparePassword(password);
    if (!passwordsMatch) {
      throw new BadRequestError("Invalid credentials");
    }
    // ! 3. get userModel existAuthModel._id
    const existUser: IUserAuthDocument = await userService.getUserByAuthId(
      existAuth._id.toString()
    );

    if (!existUser) {
      throw new BadRequestError("Invalid credentials");
    }
    // ! 4. create jwt

    const accessToken: string = generateAccessToken({
      userId: existUser._id.toString(),
      email: existAuth.email,
      username: existAuth.username,
      avatarColor: existAuth.avatarColor,
    });

    // in production: 
    // we need to get and show rf token in client, but can not do that with httpOnly= true
    // so use a rftk copy store in local storage(express only and better get tk from cookies)
    const rftkInLocalStorage = generateRefreshToken(
      { userId: existUser._id.toString() },
      res
    );

    const userAuthData: IUserAuthDocument = {
      ...existUser,

      username: existAuth!.username,
      email: existAuth!.email,
      avatarColor: existAuth!.avatarColor,
      createdAt: existAuth!.createdAt,
    } as IUserAuthDocument;

    res.status(HTTP_STATUS.OK).json({
      message: "User login successfully",
      user: userAuthData,
      token: accessToken,
      // rfToken: rftkInLocalStorage,
    });
  }
}
