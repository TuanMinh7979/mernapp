import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
import { UserCache } from "@service/redis/user.cache";

import { socketIOImageObject } from "@socket/image";

import { imageService } from "@service/db/image.service";
import { IUserDocument } from "@user/interface/user.interface";
import { IFileImageDocument } from "@image/interface/image.interface";
import { imageQueue } from "@service/queue/image.queue";

const userCache: UserCache = new UserCache();

export class Delete {
  // *   Params
  // *   Res
  public async image(req: Request, res: Response): Promise<void> {
    const { imageId } = req.params;
    // ! Socket:
    socketIOImageObject.emit("delete image", imageId);
    // ! Queue:
    imageQueue.addImageJob("removeImageFromDB", {
      imageId,
    });
    res.status(HTTP_STATUS.OK).json({ message: "Image deleted successfully" });
  }

  // *   Params
  // *   Res
  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const image: IFileImageDocument = await imageService.getImageByBackgroundId(
      req.params.bgImageId
    );
    socketIOImageObject.emit("delete image", image?._id);
    //  ! Cache:
    // const bgImageId: Promise<IUserDocument> =
    //   userCache.updateSingleUserItemInCache(
    //     `${req.currentUser!.userId}`,
    //     "bgImageId",
    //     ""
    //   ) as Promise<IUserDocument>;
    // const bgImageVersion: Promise<IUserDocument> =
    //   userCache.updateSingleUserItemInCache(
    //     `${req.currentUser!.userId}`,
    //     "bgImageVersion",
    //     ""
    //   ) as Promise<IUserDocument>;
    // (await Promise.all([bgImageId, bgImageVersion])) as [
    //   IUserDocument,
    //   IUserDocument
    // ];
    // ! Queue:
    imageQueue.addImageJob("removeImageFromDB", {
      imageId: image?._id,
    });
    res.status(HTTP_STATUS.OK).json({ message: "Image deleted successfully" });
  }
}
