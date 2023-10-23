import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";

import { socketIOImageObject } from "@socket/image";

import { imageService } from "@service/db/image.service";
import { IUserAuthDocument } from "@user/interface/user.interface";
import { IFileImageDocument } from "@image/interface/image.interface";

export class Delete {
  // *   Params
  // *   Res
  public async image(req: Request, res: Response): Promise<void> {
    const { imageId } = req.params;

    //  ! Service
    await imageService.removeImageFromDB(imageId);
    res.status(HTTP_STATUS.OK).json({ message: "Image deleted successfully" });
  }


}
