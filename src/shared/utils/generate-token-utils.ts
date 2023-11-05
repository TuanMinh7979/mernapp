import jwt from "jsonwebtoken";
import { Response } from "express";

export const generateAccessToken = (payload: any) => {
  return jwt.sign(payload, `${process.env.ACCESS_TOKEN_SECRET}`, {
    expiresIn: process.env.ACCESS_TOKEN_EXP,
  });
};

export const generateRefreshToken = (payload: object, res: Response) => {
  const rftk = jwt.sign(payload, `${process.env.REFRESH_SECRET}`, {
    expiresIn: process.env.RF_TOKEN_EXP,
  });

  // delevelop
  // res.cookie("refreshtoken", rftk);
  // production

  res.cookie("refreshtoken", rftk, {
    sameSite: "none",
    secure: true,
    httpOnly: true,
  });

  return rftk;
};
