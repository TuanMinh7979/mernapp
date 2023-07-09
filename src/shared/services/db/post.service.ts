import { PostModel } from "@post/models/post.schema";
import {
  IGetPostsQuery,
  IPostDocument,
  IQueryComplete,
  IQueryDeleted,
} from "@root/features/post/interfaces/post.interface";
import { IUserDocument } from "@user/interface/user.interface";
import { UserModel } from "@user/models/user.schema";
import mongoose, { Query, UpdateQuery } from "mongoose";

class PostService {
  public async addPostToDB(
    userId: string,
    createdPost: IPostDocument
  ): Promise<void> {
    const post: Promise<IPostDocument> = PostModel.create(createdPost);
    const user: UpdateQuery<IUserDocument> = UserModel.updateOne(
      { _id: userId },
      { $inc: { postsCount: 1 } }
    );
    await Promise.all([post, user]);
  }

  public async getPosts(
    query: IGetPostsQuery,
    skip = 0,
    limit = 0,
    sort: Record<string, 1 | -1>
  ): Promise<IPostDocument[]> {
    let postQuery = {};
    // if is a image or video post
    if (query?.imgId && query?.gifUrl) {
      postQuery = { $or: [{ imgId: { $ne: "" } }, { gifUrl: { $ne: "" } }] };
    } else if (query?.videoId) {
      postQuery = { $or: [{ videoId: { $ne: "" } }] };
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

  // count document
  public async postsCount(): Promise<number> {
    const count: number = await PostModel.find({}).countDocuments();
    return count;
  }
  public async deletePost(postId: string, userId: string): Promise<void> {
    const deletePost: Query<IQueryComplete & IQueryDeleted, IPostDocument> =
      PostModel.deleteOne({ _id: postId });
    // delete reactions here
    const decrementPostCount: UpdateQuery<IUserDocument> = UserModel.updateOne(
      { _id: userId },
      { $inc: { postsCount: -1 } }
    );
    await Promise.all([deletePost, decrementPostCount]);
  }
}

export const postService: PostService = new PostService();
