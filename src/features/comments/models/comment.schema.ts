import mongoose, { Model, Schema, model } from "mongoose";
import { ICommentDocument } from "../interfaces/comment.interface";
// _id?: string | ObjectId;
// username: string;
// avatarColor: string;
// postId: string;
// profilePicture: string;
// comment: string;
// createAt?: Date;
// //   author of then post
// userTo?: string | ObjectId;
const commentSchema:Schema= new Schema({
    postId: {type: mongoose.Schema.Types.ObjectId, ref: 'Post', index: true},
    comment: {type: String, default: ''},
    username: {type: String},
    avatarColor: {type: String},
    profilePicture: {type: String},
    createdAt: {type: Date, default:Date.now()}
})

const CommentsModel: Model<ICommentDocument>= model<ICommentDocument>('Comment', commentSchema, 'Comment')
export {CommentsModel}