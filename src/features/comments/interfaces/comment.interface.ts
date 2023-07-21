import { ObjectId } from "mongoose";

export interface ICommentDocument extends Document {
  _id?: string | ObjectId;
  username: string;
  avatarColor: string;
  postId: string;
  profilePicture: string;
  comment: string;
  createAt?: Date;
//   author of then post
  userTo?: string | ObjectId;
}

export interface ICommentJob {
  postId: string;
  userTo: string;
  userFrom: string;
  username: string;
  comment: string;
}

export interface ICommentNameList {
  count: number;
  // who are comment
  names: string[];
}

export interface IQueryComment {
  _id?: string | ObjectId;
  postId?: string | ObjectId;
}
export interface IQuerySort {
  createAt?: number;
}
