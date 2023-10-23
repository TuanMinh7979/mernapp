import { Request, Response } from "express";

import HTTP_STATUS from "http-status-codes";

import { socketIOPostObject } from "@socket/post.socket";
import { IPostDocument } from "@post/interfaces/post.interface";
import { postSchema, postWithImageSchema } from "@post/schemes/post.schemes";
import { joiValidation } from "@global/decorators/joi-validation.decorators";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { upload } from "@global/helpers/cloudinary-upload";
import { BadRequestError } from "@global/helpers/error-handler";

import { postService } from "@service/db/post.service";
import { imageService } from "@service/db/image.service";

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

    // ! 1 update post in db.Post
    //  ! Service:
    const rs = await postService.editPost(postId, updatedPost);

    // ! 2. send updatedPost to all client use emit  event "update post"
    // ! Socket:
    socketIOPostObject.emit("update post", rs, "posts");

    res.status(HTTP_STATUS.OK).json({ message: "Post updated successfully" });
  }

  // * Params:
  // * Res: void
  // * Post with new image
  @joiValidation(postWithImageSchema)
  public async postWithNewImage(req: Request, res: Response): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, profilePicture, image } =
      req.body;
    const { postId } = req.params;
    // ! 1. update body.image
    // ! Upload:
    const uploadResult: UploadApiResponse = (await upload(
      image
    )) as UploadApiResponse;
    if (!uploadResult.public_id) {
      // * uploadResult sẽ là lỗi nếu có lỗi xảy ra trong upload

      throw new BadRequestError(uploadResult.message);
    }
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId: image ? uploadResult.public_id : "",
      imgVersion: image ? uploadResult.version.toString() : "",
    } as IPostDocument;

    //  ! Service:
    // ! 2 .update postModel with body and upload result in (1)
    const rs = await postService.editPost(postId, updatedPost);
    // ! 3. emit socket "update post" to all client
    // ! Socket:
    socketIOPostObject.emit("update post", rs, "posts");
    // ! Service:
    // ! 4. create imageModel to db.Image, data :{curentUser.id, upload result from (1) , public_id and version}
    await imageService.addImage(
      req.currentUser!.userId,
      uploadResult.public_id,
      uploadResult.version.toString(),
      ""
    );

    res.status(HTTP_STATUS.OK).json({ message: "Post updated successfully" });
  }
}
