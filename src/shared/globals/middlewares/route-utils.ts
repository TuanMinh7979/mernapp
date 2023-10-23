import { NextFunction } from "express";
import bunyan from "bunyan";
import { Request, Response } from "express";
export const showRequest = (fn: Function) => {
  const logger = bunyan.createLogger({
    name: fn.name,
    level: "debug",
  });

  return (req: Request, res: Response, next: NextFunction) => {
    logger.info(">>>>>>>>>>PARAM: ", req.params);
    logger.info(">>>>>>>>>>BODY: ", req.body);

    fn(req, res);
    // .catch((err) => next(err));
  };
};
export const showRequestCookie = (fn: Function) => {
  const logger = bunyan.createLogger({
    name: fn.name,
    level: "debug",
  });

  return (req: Request, res: Response, next: NextFunction) => {
    logger.info(">>>>>>>>>>COOKIES: ", req.cookies);


    fn(req, res);
    // .catch((err) => next(err));
  };
};
