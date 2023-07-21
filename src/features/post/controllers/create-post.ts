import { joiValidation } from "@global/decorators/joi-validation.decorators";
import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
import { postSchema, postWithImageSchema } from "../schemes/post.schemes";

import { IPostDocument } from "../interfaces/post.interface";
import { ObjectId, Types } from "mongoose";
import { PostCache } from "@service/redis/post.cache";
import { socketIOPostObject } from "@socket/post.socket";
import { postQueue } from "@service/queue/post.queue";
import { upload } from "@global/helpers/cloudinary-upload";
import { BadRequestError } from "@global/helpers/error-handler";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { NumericDictionary } from "lodash";
const postCache: PostCache = new PostCache();
export class Create {
  // * Params: 
  // * Res: void 
  @joiValidation(postSchema)
  public async post(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings } =
      req.body;

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
    // ! Socket: 
    socketIOPostObject.emit("add post", createdPost);
    // ! Cache: 
    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: `${req.currentUser!.userId}`,
      uId: `${req.currentUser!.uId}`,
      createdPost,
    });
    // ! Queue:
    postQueue.addPostJob("addPostToDB", {
      key: req.currentUser!.userId,
      value: createdPost,
    });
    res
      .status(HTTP_STATUS.CREATED)
      .json({ message: "Post created successfully" });
  }

  // * Params: 
  // * Res: void
  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings, image } =
      req.body;
    // ! Upload: 
    const result:UploadApiResponse = await upload(image) as UploadApiResponse ;
    if (!result?.public_id) {
      console.log(result)
      throw new BadRequestError(result.message);
    }

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
    // ! Socket: 
    socketIOPostObject.emit("add post", createdPost);
    //  ! Cache:
    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: `${req.currentUser!.userId}`,
      uId: `${req.currentUser!.uId}`,
      createdPost,
    });
    //  ! Queue:
    postQueue.addPostJob("addPostToDB", {
      key: req.currentUser!.userId,
      value: createdPost,
    });
    // imageQueue.addImageJob("addImageToDB", {
    //   key: `${req.currentUser!.userId}`,
    //   imgId: result.public_id,
    //   imgVersion: result.version.toString(),
    // });
    res
      .status(HTTP_STATUS.CREATED)
      .json({ message: "Post created with image successfully" });
  }


  


}
 