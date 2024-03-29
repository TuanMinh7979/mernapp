import { PostModel } from "@post/models/post.schema";
import {
  IGetPostsQuery,
  IPostDocument,
  IQueryComplete,
  IQueryDeleted,
} from "@root/features/post/interfaces/post.interface";
import { IUserAuthDocument } from "@user/interface/user.interface";
import { UserModel } from "@user/models/user.schema";
import mongoose, { Query, UpdateQuery } from "mongoose";

class PostService {
  //   * Params:
  //   * userId: autho userId
  //   * createdPost: data to save
  //   * Res: void
  public async addPostToDB(
    userId: string,
    createdPost: IPostDocument
  ): Promise<void> {
    const post: Promise<IPostDocument> = PostModel.create(createdPost);
    const user: UpdateQuery<IUserAuthDocument> = UserModel.updateOne(
      { _id: userId },
      { $inc: { postsCount: 1 } }
    );
    await Promise.all([post, user]);
  }

  //   * Params:
  //   * userId: IGetPostsQuery
  //   * Res: IPostDocument[]
  public async getPosts(
    query: IGetPostsQuery,
    skip = 0,
    limit = 0,
    sort: Record<string, 1 | -1>
  ): Promise<IPostDocument[]> {
    let postQuery = {};
    // if is a image
    // ? check later
    if (query?.imgId && query?.gifUrl) {
      postQuery = { $or: [{ imgId: { $ne: "" } }, { gifUrl: { $ne: "" } }] };
    } else {
      postQuery = query;
    }

    const posts: IPostDocument[] = await PostModel.aggregate([
      { $match: postQuery },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
    ]);
    return posts;
  }

  //   * Params:
  //   * Res:len
  public async postsCount(): Promise<number> {
    const count: number = await PostModel.find({}).countDocuments();
    return count;
  }

  public async postsWithImageCount(): Promise<number> {
    const count: number = await PostModel.find({
      $or: [{ imgId: { $ne: "" } }, { gifUrl: { $ne: "" } }],
    }).countDocuments();
    return count;
  }
  //   * Params:
  //* postId:id of post
  //* userId: user._id of author
  //   * Res:len
  public async deletePost(postId: string, userId: string): Promise<void> {
    const deletePost: Query<IQueryComplete & IQueryDeleted, IPostDocument> =
      PostModel.deleteOne({ _id: postId });
    // delete reactions here
    const decrementPostCount: UpdateQuery<IUserAuthDocument> =
      UserModel.updateOne({ _id: userId }, { $inc: { postsCount: -1 } });
    await Promise.all([deletePost, decrementPostCount]);
  }
  //   * Params:
  //* postId:id of post
  //* updatedPost: data to update
  //   * Res:void
  public async editPost(
    postId: string,
    updatedPost: IPostDocument
  ): Promise<IPostDocument> {
    const updatePost = await PostModel.findOneAndUpdate(
      { _id: postId.trim() },
      { $set: updatedPost },
      { new: true }
    );
    return updatePost as unknown as IPostDocument;
  }
}

export const postService: PostService = new PostService();
