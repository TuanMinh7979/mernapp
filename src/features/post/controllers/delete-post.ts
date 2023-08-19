import { Request, Response } from "express";
import { PostCache } from "@service/redis/post.cache";
import HTTP_STATUS from "http-status-codes";
import { postQueue } from "@service/queue/post.queue";
import { postService } from "@service/db/post.service";
import { socketIOPostObject } from "@socket/post.socket";
const postCache: PostCache = new PostCache();
export class Delete {
  // * Params:
  // * Res: void
  public async post(req: Request, res: Response): Promise<void> {
    // ! Socket:
    socketIOPostObject.emit("delete post", req.params.postId);
    // ! Cache:
    // await postCache.deletePostFromCache(req.params.postId, `${req.currentUser!.userId}`);
    // ! Queue:
    // postQueue.addPostJob('deletePostFromDB', { keyOne: req.params.postId, keyTwo: req.currentUser!.userId });

    //  ! Service:
    await postService.deletePost(req.params.postId, req.currentUser!.userId);
    res.status(HTTP_STATUS.OK).json({ message: "Post deleted successfully" });
  }
} 
