import { IUserDocument } from '@user/interface/user.interface';
import { ObjectId } from 'mongodb';
import mongoose, { Document } from 'mongoose';


export interface IFollowers {
  userId: string;
}

export interface IFollowerDocument extends Document {
  _id: mongoose.Types.ObjectId | string;
  followerId: mongoose.Types.ObjectId;
  followeeId: mongoose.Types.ObjectId;
  createdAt?: Date;
}

export interface IFollower {
  _id: mongoose.Types.ObjectId | string;
  followeeId?: IFollowerData;
  followerId?: IFollowerData;
  createdAt?: Date;
}

export interface IFollowerData {
  avatarColor: string;//in AuthModel
  followersCount: number;
  followingCount: number;
  profilePicture: string;
  postCount: number;
  username: string;//in AuthModel
  uId: string; // in AuthModel
  _id?: mongoose.Types.ObjectId;
  userProfile?: IUserDocument;
}

export interface IFollowerJobData {
  keyOne?: string;
  keyTwo?: string;
  username?: string;
  followDocumentId?: ObjectId;
}

export interface IBlockedUserJobData {
  keyOne?: string;
  keyTwo?: string;
  type?: string;
}