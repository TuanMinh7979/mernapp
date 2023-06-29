import { Request, Response } from "express";
import { joiValidation } from "@global/decorators/joi-validation.decorators";
import { authService } from "@service/db/auth.service";
import { IAuthDocument, ISignUpData } from "@auth/interfaces/auth.interface";
import { BadRequestError } from "@global/helpers/error-handler";
import HTTP_STATUS from "http-status-codes";
import { IUserDocument } from "@user/interface/user.interface";
import jwt from "jsonwebtoken";
import { config } from "@root/config";
import { loginSchema } from "@auth/schemes/signin";

import { userService } from "@service/db/user.service";

export class SignOut {
  public async update(req: Request, res: Response): Promise<void> {
    req.session = null;
    res
      .status(HTTP_STATUS.OK)
      .json({ message: "logout success", user: {}, token: {} });
  }
}
