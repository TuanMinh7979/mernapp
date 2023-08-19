import { Request, Response } from "express";
import { PostCache } from "@service/redis/post.cache";
import HTTP_STATUS from "http-status-codes";
import { postQueue } from "@service/queue/post.queue";
import { socketIOPostObject } from "@socket/post.socket";
import { IPostDocument } from "@post/interfaces/post.interface";
import { postSchema, postWithImageSchema } from "@post/schemes/post.schemes";
import { joiValidation } from "@global/decorators/joi-validation.decorators";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { upload } from "@global/helpers/cloudinary-upload";
import { BadRequestError } from "@global/helpers/error-handler";
import { imageQueue } from "@service/queue/image.queue";
import { postService } from "@service/db/post.service";
import { imageService } from "@service/db/image.service";
const postCache: PostCache = new PostCache();

export class Update {
  // * Params:
  // * Res: void
  // * Post no image
  @joiValidation(postSchema)
  public async posts(req: Request, res: Response): Promise<void> {
    const {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion,
      imgId,
      profilePicture,
    } = req.body;
    const { postId } = req.params;
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId,
      imgVersion,
    } as IPostDocument;

    // ! Cache:
    const postUpdated: IPostDocument = await postCache.updatePostInCache(
      postId,
      updatedPost
    );

    // ! Queue:
    postQueue.addPostJob("updatePostInDB", { key: postId, value: postUpdated });

    //  ! Service:
    // const rs = await postService.editPost(postId, updatedPost);
    // ! Socket:

    socketIOPostObject.emit("update post", postUpdated, "posts");
    res.status(HTTP_STATUS.OK).json({ message: "Post updated successfully" });
  }

  // * Params:
  // * Res: void
  // * Post with new image
  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { imgId, imgVersion } = req.body;
    if (imgId && imgVersion) {
      Update.prototype.updatePost(req);
    } else {
      // ! Upload:
      const result: UploadApiResponse =
        await Update.prototype.addImageToExistingPost(req);
      if (!result.public_id) {
        // * result sẽ là lỗi nếu có lỗi xảy ra trong upload

        throw new BadRequestError(result.message);
      }
    }
    res.status(HTTP_STATUS.OK).json({ message: "Post updated successfully" });
  }
  // * Params:
  // * Res: void
  private async updatePost(req: Request): Promise<void> {
    const {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion,
      imgId,
      profilePicture,
      videoId,
      videoVersion,
    } = req.body;
    const { postId } = req.params;
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId: imgId ? imgId : "",
      imgVersion: imgVersion ? imgVersion : "",
    } as IPostDocument;

    // ! Cache:
    const postUpdated: IPostDocument = await postCache.updatePostInCache(
      postId,
      updatedPost
    );

    // ! Queue:
    postQueue.addPostJob("updatePostInDB", { key: postId, value: postUpdated });
    //  ! Service:
    // const rs = await postService.editPost(postId, updatedPost);
    // ! Socket:
    socketIOPostObject.emit("update post", postUpdated, "posts");
  }
  // * Params:
  // * Res: void
  private async addImageToExistingPost(
    req: Request
  ): Promise<UploadApiResponse> {
    const {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      profilePicture,
      image,
      video,
    } = req.body;
    const { postId } = req.params;
    // ! Upload:
    const result: UploadApiResponse = (await upload(
      image
    )) as UploadApiResponse;

    if (!result?.public_id) {
      return result;
    }
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId: image ? result.public_id : "",
      imgVersion: image ? result.version.toString() : "",
    } as IPostDocument;

    // ! Cache:
    const postUpdated: IPostDocument = await postCache.updatePostInCache(
      postId,
      updatedPost
    );

    // ! Queue:
    postQueue.addPostJob("updatePostInDB", { key: postId, value: postUpdated });

    //  ! Service:
    // const rs = await postService.editPost(postId, updatedPost);
    // ! Socket:
    socketIOPostObject.emit("update post", postUpdated, "posts");

    //  ! Queue:
    imageQueue.addImageJob("addImageToDB", {
      key: `${req.currentUser!.userId}`,
      imgId: result.public_id,
      imgVersion: result.version.toString(),
    });

    // ! Service:
    // await imageService.addImage(
    //   req.currentUser!.userId,
    //   result.public_id,
    //   result.version.toString(),
    //   ""
    // );
    return result;
  }
}
