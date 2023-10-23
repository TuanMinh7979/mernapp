import { joiValidation } from "@global/decorators/joi-validation.decorators";
import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
import { postSchema, postWithImageSchema } from "../schemes/post.schemes";

import { IPostDocument } from "../interfaces/post.interface";
import { ObjectId, Types } from "mongoose";

import { socketIOPostObject } from "@socket/post.socket";

import { upload } from "@global/helpers/cloudinary-upload";
import { BadRequestError } from "@global/helpers/error-handler";
import {  UploadApiResponse } from "cloudinary";

import { postService } from "@service/db/post.service";
import { imageService } from "@service/db/image.service";
export class Create {
  //  Req Body:
  //  Res: void
  @joiValidation(postSchema)
  public async post(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings } =
      req.body;

    //  ! 1. create postModel from body and currentUser
    const postObjectId = new Types.ObjectId();
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount: 0,
      imgVersion: "",
      imgId: "",
      videoId: "",
      videoVersion: "",
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 },
    } as IPostDocument;
    // ! 2. Emit a socket "add post" to client
    // ! Socket:
    socketIOPostObject.emit("add post", createdPost);
    await postService.addPostToDB(req.currentUser!.userId, createdPost);
    res
      .status(HTTP_STATUS.CREATED)
      .json({ message: "Post created successfully" });
  }

  // * Params:
  // * Res: void
  @joiValidation(postWithImageSchema)
  public async postWithNewImage(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings, image } =
      req.body;
    // ! 1. upload image
    // ! Upload:
    const result: UploadApiResponse = (await upload(
      image
    )) as UploadApiResponse;
    if (!result?.public_id) {

      throw new BadRequestError(result.message);
    }
    //  ! 2. create postModel with imgVersion, imgId from (1)
    const postObjectId = new Types.ObjectId();
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount: 0,
      imgVersion: result.version.toString(),
      imgId: result.public_id,
      videoId: "",
      videoVersion: "",
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 },
    } as IPostDocument;
    // ! 3. create socket "add post" with data is postModel
    // ! Socket:
    socketIOPostObject.emit("add post", createdPost);

    // ! 4. save postModel to db.Post
    //  ! Service
    await postService.addPostToDB(req.currentUser!.userId, createdPost);

    // ! 5. create imageModel to db.Image, data :{curentUser.id, upload result from (1) , public_id and version}
    // ! Service:
    await imageService.addImage(
      req.currentUser!.userId,
      result.public_id,
      result.version.toString(),
      ""
    );
    res
      .status(HTTP_STATUS.CREATED)
      .json({ message: "Post created with image successfully" });
  }
}
