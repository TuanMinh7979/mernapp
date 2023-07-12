import { Request, Response } from 'express';
import { PostCache } from '@service/redis/post.cache';
import HTTP_STATUS from 'http-status-codes';
import { postQueue } from '@service/queue/post.queue';



const postCache: PostCache = new PostCache();

export class Delete {
  public async post(req: Request, res: Response): Promise<void> {
    // socketIOPostObject.emit('delete post', req.params.postId);
    // clear in cache
    console.log("------------1")
    await postCache.deletePostFromCache(req.params.postId, `${req.currentUser!.userId}`);

    // clear in DB through queue
    console.log("------------2")
    postQueue.addPostJob('deletePostFromDB', { keyOne: req.params.postId, keyTwo: req.currentUser!.userId });
    res.status(HTTP_STATUS.OK).json({ message: 'Post deleted successfully' });
  }
}