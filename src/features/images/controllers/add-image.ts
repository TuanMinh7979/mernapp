import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
import { joiValidation } from "@global/decorators/joi-validation.decorators";
import { addImageSchema } from "@image/schemes/image";
import { UploadApiResponse } from "cloudinary";
import { BadRequestError } from "@global/helpers/error-handler";
import { IBgUploadResponse } from "@image/interface/image.interface";
import { Helpers } from "@global/helpers/helper";
import { upload } from "@global/helpers/cloudinary-upload";
import { imageService } from "@service/db/image.service";

export class Add {
  //    * Params:
  //    * Res:
  @joiValidation(addImageSchema)
  public async profileImage(req: Request, res: Response): Promise<void> {
    const result: UploadApiResponse = (await upload(
      req.body.image,
      req.currentUser!.userId,
      true,
      true
    )) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError("File upload: Error occurred. Try again.");
    }
    const url = result.url;
    //  ! Service:
    await imageService.addUserProfileImageToDB(
      req.currentUser!.userId,
      url,
      result.public_id,
      result.version.toString()
    );
    res
      .status(HTTP_STATUS.OK)
      .json({ message: "Image added successfully", url });
  }
  //    * Params:
  //    * Res:
  @joiValidation(addImageSchema)
  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const { version, publicId }: IBgUploadResponse =
      await Add.prototype.backgroundUpload(req.body.image);
    await imageService.addBackgroundImageToDB(
      req.currentUser!.userId,
      publicId,
      version.toString()
    );
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
