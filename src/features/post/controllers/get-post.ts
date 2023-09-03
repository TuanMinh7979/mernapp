import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
import { IPostDocument } from "@post/interfaces/post.interface";
import { PostCache } from "@service/redis/post.cache";
import { postService } from "@service/db/post.service";
import { ServerError } from "@global/helpers/error-handler";
const postCache: PostCache = new PostCache();
const PAGE_SIZE = 3;
export class Get {
  // * Params:
  // * Res: void
  public async posts(req: Request, res: Response): Promise<void> {
    try {
      const { page } = req.params;
      const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
      const limit: number = PAGE_SIZE * parseInt(page);
      const newSkip: number = skip === 0 ? skip : skip + 1;
      let posts: IPostDocument[] = [];
      let totalPosts = 0;
      // start index as newSkip and limit as end index
      // first get in redis
      // ! Cache:
      // const cachedPosts: IPostDocument[] = await postCache.getPostsFromCache(
      //   "post",
      //   newSkip,
      //   limit - 1
      // );
      // if (cachedPosts.length) {
      //   posts = cachedPosts;
      //   totalPosts = await postCache.getTotalPostsInCache();
      // } else {
      // if no cached posts, then get from database
      //  ! Service :
      posts = await postService.getPosts({}, skip, limit, { createdAt: -1 });
      totalPosts = await postService.postsCount();
      // }
      res
        .status(HTTP_STATUS.OK)
        .json({ message: "All posts", posts, totalPosts });
    } catch (e: any) {
      throw new ServerError("Server error. Try again.");
    }
  }
  // * Params:
  // * Res: void
  public async postsWithImages(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
    const newSkip: number = skip === 0 ? skip : skip + 1;
    // let posts: IPostDocument[] = [];
    // ! Cache:
    // const cachedPosts: IPostDocument[] =
    //   await postCache.getPostsWithImagesFromCache("post", newSkip, limit - 1);
    // posts = cachedPosts.length
    //   ? cachedPosts
    //   : await postService.getPosts(
    //       { imgId: "$ne", gifUrl: "$ne" },
    //       skip,
    //       limit,
    //       { createdAt: -1 }
    //     );
    // ! Service
    const posts: IPostDocument[] = await postService.getPosts(
      { imgId: "$ne", gifUrl: "$ne" },
      skip,
      limit,
      { createdAt: -1 }
    );
    res
      .status(HTTP_STATUS.OK)
      .json({ message: "All posts with images", posts });
  }
}
