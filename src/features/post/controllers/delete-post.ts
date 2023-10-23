import { Request, Response } from "express";

import HTTP_STATUS from "http-status-codes";

import { postService } from "@service/db/post.service";
import { socketIOPostObject } from "@socket/post.socket";

export class Delete {
  // * Params:
  // * Res: void
  public async post(req: Request, res: Response): Promise<void> {
    // ! 1. emit socket "delete post", data: id
    // ! Socket:
    socketIOPostObject.emit("delete post", req.params.postId);
 
    // ! 2. delete in db.Post
    //  ! Service:
    await postService.deletePost(req.params.postId, req.currentUser!.userId);
    res.status(HTTP_STATUS.OK).json({ message: "Post deleted successfully" });
  }
} 
