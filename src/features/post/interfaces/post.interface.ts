import { IReactions } from '@root/features/reactions/interfaces/reaction.interface';
import { ObjectId } from 'mongodb';
import mongoose, { Document } from 'mongoose';

//  for Post Model 
export interface IPostDocument extends Document {
  _id?: string | mongoose.Types.ObjectId;
  userId: string;
//   authId: string ;
  username: string;
  email: string;
  avatarColor: string;
  profilePicture: string;
  post: string;
  bgColor: string;
  commentsCount: number;
  imgVersion?: string;
  imgId?: string;
  videoId?: string;
  videoVersion?: string;
  feelings?: string;
  gifUrl?: string;
  privacy?: string;
  reactions?: IReactions;
  createdAt?: Date; 
}

export interface IGetPostsQuery {
  _id?: ObjectId | string;
  username?: string;
  // if is a image or video post
  imgId?: string;
  gifUrl?: string;
  videoId?: string;
}

export interface ISavePostToCache {
  key: ObjectId | string;
  currentUserId: string;

  createdPost: IPostDocument;
}

export interface IPostJobData {
  key?: string;
  value?: IPostDocument;
  keyOne?: string;
  keyTwo?: string;
}

export interface IQueryComplete {
  ok?: number;
  n?: number;
}

export interface IQueryDeleted {
  deletedCount?: number;
}