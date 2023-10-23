import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
import { IPostDocument } from "@post/interfaces/post.interface";

import { postService } from "@service/db/post.service";
import { ServerError } from "@global/helpers/error-handler";

const PAGE_SIZE = 10;
export class Get {
  //  Params:
  //  Res: void
  public async posts(req: Request, res: Response): Promise<void> {
    try {

      const { page } = req.params;
      // ! 1. create skip and limit from constant PAGE_SIZE and page
      const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
      const limit: number = PAGE_SIZE * parseInt(page);

      let posts: IPostDocument[] = [];
      let totalPosts = 0;

      //  ! Service :
      //  ! 2. get posts from (1)
      posts = await postService.getPosts({}, skip, limit, { createdAt: -1 });
      // ! 3. get total post count, use for continue load post or not in client
      totalPosts = await postService.postsCount();

      res
        .status(HTTP_STATUS.OK)
        .json({ message: "All posts", posts, totalPosts });
    } catch (e: any) {
      throw new ServerError("Server error. Try again.");
    }
  }
  //  Params:
  //  Res: void
  public async postsWithImages(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
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
