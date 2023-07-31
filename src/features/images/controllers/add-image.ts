import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
import { UserCache } from "@service/redis/user.cache";
import { joiValidation } from "@global/decorators/joi-validation.decorators";
import { addImageSchema } from "@image/schemes/image";
import { UploadApiResponse } from "cloudinary";
import { BadRequestError } from "@global/helpers/error-handler";
import { IUserDocument } from "@user/interface/user.interface";
import { socketIOImageObject } from "@socket/image";
import { IBgUploadResponse } from "@image/interface/image.interface";
import { imageQueue } from "@service/queue/image.queue";
import { Helpers } from "@global/helpers/helper";
import { upload } from "@global/helpers/cloudinary-upload";

const userCache: UserCache = new UserCache();

export class Add {
  //    * Params:
  //    * Res:
  @joiValidation(addImageSchema)
  public async profileImage(req: Request, res: Response): Promise<void> {

    console.log(req.currentUser!.userId);
    // console.log(req.body.image);
    
    const result: UploadApiResponse = (await upload(
      req.body.image,
      req.currentUser!.userId,
      true,
      true
    )) as UploadApiResponse;
    if (!result?.public_id) {
    
      
      throw new BadRequestError("File upload: Error occurred. Try again.");
    }
    const url =
     `https://res.cloudinary.com/djnekmzdf/image/upload/v${result.version}/${result.public_id}`;
    // ! Cache:
    // const cachedUser: IUserDocument =
    //   (await userCache.updateSingleUserItemInCache(
    //     `${req.currentUser!.userId}`,
    //     "profilePicture",
    //     url
    //   )) as IUserDocument;
    //  ! Socket:
    // socketIOImageObject.emit("update user", cachedUser);
    imageQueue.addImageJob("addUserProfileImageToDB", {
      key: `${req.currentUser!.userId}`,
      value: url,
      imgId: result.public_id,
      imgVersion: result.version.toString(),
    });
    res.status(HTTP_STATUS.OK).json({ message: "Image added successfully" });
  }
  //    * Params:
  //    * Res:
  @joiValidation(addImageSchema)
  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const { version, publicId }: IBgUploadResponse =
      await Add.prototype.backgroundUpload(req.body.image);
    // ! Cache:
    // const bgImageId: Promise<IUserDocument> =
    //   userCache.updateSingleUserItemInCache(
    //     `${req.currentUser!.userId}`,
    //     "bgImageId",
    //     publicId
    //   ) as Promise<IUserDocument>;
    // const bgImageVersion: Promise<IUserDocument> =
    //   userCache.updateSingleUserItemInCache(
    //     `${req.currentUser!.userId}`,
    //     "bgImageVersion",
    //     version
    //   ) as Promise<IUserDocument>;
    // const response: [IUserDocument, IUserDocument] = (await Promise.all([
    //   bgImageId,
    //   bgImageVersion,
    // ])) as [IUserDocument, IUserDocument];
    // ! Socket: 
    // socketIOImageObject.emit("update user", {
    //   bgImageId: publicId,
    //   bgImageVersion: version,
    //   userId: response[0],
    // });
    imageQueue.addImageJob("updateBGImageInDB", {
      key: `${req.currentUser!.userId}`,
      imgId: publicId,
      imgVersion: version.toString(),
    });
    res.status(HTTP_STATUS.OK).json({ message: "Image added successfully" });
  }
  //    * Params:
  //    * Res:
  private async backgroundUpload(image: string): Promise<IBgUploadResponse> {
    const isDataURL = Helpers.isDataURL(image);
    let version = "";
    let publicId = "";
    if (isDataURL) {
      // if is base 64
      const result: UploadApiResponse = (await upload(
        image
      )) as UploadApiResponse;
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      } else {
        version = result.version.toString();
        publicId = result.public_id;
      }
    } else {
      const value = image.split("/");
      version = value[value.length - 2];
      publicId = value[value.length - 1];
    }
    return { version: version.replace(/v/g, ""), publicId };
  }
}
