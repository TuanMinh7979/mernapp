import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
export class SignOut {
  //   * Params:
  // * Res: void
  public async update(req: Request, res: Response): Promise<void> {
    res
      .clearCookie("refreshtoken")
      .status(HTTP_STATUS.OK)
      .json({ message: "logout success" });
  }
}
