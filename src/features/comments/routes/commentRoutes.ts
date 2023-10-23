import { Add } from '@comment/controllers/add-comment';
import { Get } from '@comment/controllers/get-comment';
import { authMiddleware } from '@global/middlewares/aurth-middleware';
import express, { Router } from 'express';


class CommentRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/post/comments/:postId', authMiddleware.checkAuthencation, Get.prototype.comments);
    this.router.get('/post/commentsnames/:postId', authMiddleware.checkAuthencation, Get.prototype.commentsNamesFromCache);
    this.router.get('/post/single/comment/:postId/:commentId', authMiddleware.checkAuthencation, Get.prototype.singleComment);
    this.router.post('/post/comment', authMiddleware.checkAuthencation, Add.prototype.comment);

    return this.router;
  }
}

export const commentRoutes: CommentRoutes = new CommentRoutes();