import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
import { blockUserService } from "@service/db/block-user.service";

export class BlockUser {
  //* Params :
  //* Res: void
  public async block(req: Request, res: Response): Promise<void> {
    const { otherId } = req.params;
    //  ! Service:
    await blockUserService.blockUser(req.currentUser!.userId, otherId);
    res.status(HTTP_STATUS.OK).json({ message: "User blocked" });
  }
  //* Params :
  //* Res: void
  public async unblock(req: Request, res: Response): Promise<void> {
    const { otherId } = req.params;
    //  ! Service:
    await blockUserService.unblockUser(req.currentUser!.userId, otherId);
    res.status(HTTP_STATUS.OK).json({ message: "User unblocked" });
  }

}
