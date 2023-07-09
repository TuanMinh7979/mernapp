import { authMiddleware } from "@global/helpers/aurth-middleware";
import express, { Router } from "express";
import { Create } from "../controllers/create-post";
import { Get } from "@post/controllers/get-post";
import { Delete } from "@post/controllers/delete-post";

class PostRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get(
      "/post/all/:page",
      authMiddleware.checkAuthencation,
      Get.prototype.posts
    );
    this.router.get(
      "/post/images/:page",
      authMiddleware.checkAuthencation,
      Get.prototype.postsWithImages
    );

    this.router.post(
      "/post",
      authMiddleware.checkAuthencation,
      Create.prototype.post
    );
    this.router.post(
      "/post/image/post",
      authMiddleware.checkAuthencation,
      Create.prototype.postWithImage
    );
    
    this.router.delete(
      "/post/:postId",
      authMiddleware.checkAuthencation,
      Delete.prototype.post
    );
    

    return this.router;
  }
}

export const postRoutes: PostRoutes = new PostRoutes();
