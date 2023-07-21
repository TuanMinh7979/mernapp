import { ObjectId } from "mongodb";
import { Request, Response } from "express";
import { joiValidation } from "@global/decorators/joi-validation.decorators";
import { authService } from "@service/db/auth.service";
import { IAuthDocument, ICreateAuthData } from "@auth/interfaces/auth.interface";
import { BadRequestError } from "@global/helpers/error-handler";

import HTTP_STATUS from "http-status-codes";

import {

  IUserDocument,
} from "@user/interface/user.interface";
import jwt from "jsonwebtoken";
import { config } from "@root/config";
import { loginSchema } from "@auth/schemes/signin";
import { userService } from "@service/db/user.service";
export class SignIn {

  // * Params: 
  // * Res: void 

  @joiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthByUsername(
      username
    );
    if (!existingUser) {
      throw new BadRequestError("Invalid credentials");
    }

    const passwordsMatch: boolean = await existingUser.comparePassword(
      password
    );
    if (!passwordsMatch) {
      throw new BadRequestError("Invalid credentials");
    }
    const user: IUserDocument = await userService.getUserByAuthId(
      existingUser._id.toString()
    );
   
    if (!user) {
      throw new BadRequestError("Invalid credentials");
    }
    const userJwt: string = jwt.sign(
      {
        userId: user._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor,
      },
      config.JWT_TOKEN!
    );
    req.session = { jwt: userJwt };
    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser!._id,
      username: existingUser!.username,
      email: existingUser!.email,
      avatarColor: existingUser!.avatarColor,
      uId: existingUser!.uId,
      createdAt: existingUser!.createdAt,
    } as IUserDocument;
    res.status(HTTP_STATUS.OK).json({
      message: "User login successfully",
      user: userDocument,
      token: userJwt,
    });
  }
}
