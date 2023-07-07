import { authMiddleware } from '@global/helpers/aurth-middleware';
import express, { Router } from 'express';
import { Create } from '../controllers/create-post';


class PostRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
 
    this.router.post('/post', authMiddleware.checkAuthencation, Create.prototype.post);
    this.router.post('/post/image/post', authMiddleware.checkAuthencation, Create.prototype.postWithImage);

    return this.router;
  }
}

export const postRoutes: PostRoutes = new PostRoutes();