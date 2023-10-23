import { ObjectId } from "mongodb";
import { Request, Response } from "express";
import { joiValidation } from "@global/decorators/joi-validation.decorators";
import { signupSchema } from "@auth/schemes/signup";
import { authService } from "@service/db/auth.service";
import {
  IAuthDocument
  
} from "@auth/interfaces/auth.interface";
import { BadRequestError } from "@global/helpers/error-handler";
import { Helpers } from "@global/helpers/helper";
import { UploadApiResponse } from "cloudinary";
import { upload } from "@global/helpers/cloudinary-upload";

import HTTP_STATUS from "http-status-codes";
import { IUserAuthDocument, IUserDocument } from "@user/interface/user.interface";
import jwt from "jsonwebtoken";
import { config } from "@root/config";

import { userService } from "@service/db/user.service";
export class SignUp {
  //Req body:
  // username
  // password
  // email
  // avatarColor: for none avatar user
  // avatarImage
  //Res void
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;
    

    // ! 1. check if use exist by username and email:
    const checkIfUserExists: IAuthDocument =
      await authService.getAuthByUsernameOrEmail(username, email); //


    if (checkIfUserExists) {
      throw new BadRequestError("Invalid credentials ");
    }
    // ! 2. create data for Auth model and User model
    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    
    const authModelData: IAuthDocument = {
      _id: authObjectId,

      username: Helpers.firstLetterUppercase(username),
      email: email.toLowerCase(),
      password,
      avatarColor,

    } as IAuthDocument;

    const userModelData:IUserDocument = {
      _id: userObjectId,
      authId: authObjectId,

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
    } as unknown as IUserDocument ;
    // !  3.upload avatar image use public id is: `${userObjectId}/upload`
    const result: UploadApiResponse = (await upload(
      avatarImage,
      `${userObjectId}/upload`,
      true,
      true
    )) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError("File upload: Invalid credentials");
    }
    userModelData.profilePicture = result.url;

    // ! Service:
    await authService.create(authModelData);
    await userService.create(userModelData);


    res.status(HTTP_STATUS.CREATED).json({
      message: "user created successfully",
     
    });
  }
}
