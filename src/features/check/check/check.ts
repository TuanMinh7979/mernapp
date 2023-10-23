import { socketIOChatObject } from "@socket/chat";
import HTTP_STATUS from "http-status-codes";
import { Request, Response } from "express";
export class Check {
  // * Params:
  // * Res:
  public async checkUserOnline(req: Request, res: Response): Promise<void> {
    const online = socketIOChatObject.sockets.adapter.rooms.has(req.params.id);
    res.status(HTTP_STATUS.OK).json({ online });
  }
}
