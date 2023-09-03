import { ObjectId } from "mongodb";
import { Request, Response } from "express";
import { joiValidation } from "@global/decorators/joi-validation.decorators";
import { signupSchema } from "@auth/schemes/signup";
import { authService } from "@service/db/auth.service";
import {
  IAuthDocument,
  ICreateAuthData,
} from "@auth/interfaces/auth.interface";
import { BadRequestError } from "@global/helpers/error-handler";
import { Helpers } from "@global/helpers/helper";
import { UploadApiResponse } from "cloudinary";
import { upload } from "@global/helpers/cloudinary-upload";
import { rest } from "lodash";
import HTTP_STATUS from "http-status-codes";
import { UserCache } from "@service/redis/user.cache";
import { IUserDocument } from "@user/interface/user.interface";
import { omit } from "lodash";

import jwt from "jsonwebtoken";
import { config } from "@root/config";
import { authQueue } from "@service/queue/auth.queue";
import { userQueue } from "@service/queue/user.queue";

const userCache: UserCache = new UserCache();
export class SignUp {
  //   * Params:
  // * username:
  // * email,
  // * password,
  // * avatarColor, avatarImage
  // * avatarImage
  // * Res: void
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;
    console.log("INPUT", username, email);

    const checkIfUserExists: IAuthDocument =
      await authService.getAuthByUsernameOrEmail(username, email); //
    console.log(checkIfUserExists);

    if (checkIfUserExists) {
      throw new BadRequestError("Invalid credentials ");
    }
    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;
    const authData: IAuthDocument = SignUp.prototype.createAuthData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor,
    });    
    const result: UploadApiResponse = (await upload(
      avatarImage,
      `${userObjectId}/upload`,
      true,
      true
    )) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError("File upload: Invalid credentials");
    }

    // ! Cache: user data for cache
    const userDataForCache: IUserDocument = SignUp.prototype.createUserData(
      authData,
      userObjectId
    );


    userDataForCache.profilePicture = result.url;
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

    // * remove some property for User Document
    omit(userDataForCache, [
      "uId",
      "username",
      "email",
      "avatarColor",
      "password",
    ]);
    // ! Queue:
    authQueue.addAuthUserJob("addAuthUserToDb", { value: authData });
    userQueue.addUserToDbJob("addUserToDB", { value: userDataForCache });

    const userJwt = SignUp.prototype.signupToken(authData, userObjectId);
    req.session = {
      jwt: userJwt,
    };
    res.status(HTTP_STATUS.CREATED).json({
      message: "user created successfully",
      user: userDataForCache,
      token: userJwt,
    });
  }

  //   * Params:
  // * data: IAuthDocument data to create jwt
  // * userObjectId: User._id to create jwt ,
  // * Res: string
  private signupToken(data: IAuthDocument, userObjectId: ObjectId): string {
    return jwt.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor,
      },
      config.JWT_TOKEN!
    );
  }
  //   * Params:
  // * data: ICreateAuthData data
  // * Res: IAuthDocument
  private createAuthData(data: ICreateAuthData): IAuthDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email: email.toLowerCase(),
      password,
      avatarColor,
      createdAt: new Date(),
    } as IAuthDocument;
  }
  //   * Params:
  // * data: IAuthDocument data
  // * userObjectId:  objectId to create User Document
  // * Res: IUserDocument
  private createUserData(
    data: IAuthDocument,
    userObjectId: ObjectId
  ): IUserDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email,
      password,
      avatarColor,
      profilePicture: "",
      blocked: [],
      blockedBy: [],
      work: "",
      location: "",
      school: "",
      quote: "",
      bgImageVersion: "",
      bgImageId: "",
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true,
      },
      social: {
        facebook: "",
        instagram: "",
        twitter: "",
        youtube: "",
      },
    } as unknown as IUserDocument;
  }
}
