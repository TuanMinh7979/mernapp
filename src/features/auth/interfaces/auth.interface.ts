import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { IUserAuthDocument } from '@user/interface/user.interface';

declare global {
  namespace Express {
    interface Request {
      currentUser?: AccessTokenPayload;
    }
  }
}
// is jwt interface and currentUser
export interface AccessTokenPayload {
  userId: string;

  email: string;
  username: string;
  avatarColor: string;
  iat?: number;
}



// is AuthModel interface
export interface IAuthDocument extends Document {
  _id: string | ObjectId;

  username: string;
  email: string;
  password?: string;
  avatarColor: string;
  createdAt: Date;
  passwordResetToken?: string;
  passwordResetExpires?: number | string;
  comparePassword(password: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}



export interface IAuthJob {
  value?: string | IAuthDocument | IUserAuthDocument;
}


export interface IDecodedToken {
  userId: string;
  iat: number;
  exp: number;
}