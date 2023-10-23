import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "@root/config";
import { NotAuthorizedError } from "@global/helpers/error-handler";
import { AccessTokenPayload } from "@auth/interfaces/auth.interface";
import Logger from "bunyan";
const log: Logger = config.createLogger("AuthMiddleware");
export class AuthMiddleware {
  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    const accessToken = req.header("Authorization");
    if (!accessToken) {
      throw new NotAuthorizedError(
        "Authen failed, Access Token is not available, login again please"
      );
    }

    try {
      const payload: AccessTokenPayload = jwt.verify(
        accessToken,
        config.ACCESS_TOKEN_SECRET!
      ) as AccessTokenPayload;

      
      req.currentUser = payload;
    } catch (error) {
      log.error(error);

      throw new NotAuthorizedError(`Authen failed, your access token has expired(over ${process.env.ACCESS_TOKEN_EXP}), refresh new token or login again please`);
    }
    next();
  }

  public checkAuthencation(
    req: Request,
    _res: Response,
    next: NextFunction
  ): void {
    if (!req.currentUser) {
      throw new NotAuthorizedError(
        "Authentication is required to access this route."
      );
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
