import { authMiddleware } from "@global/helpers/aurth-middleware";
import { Get } from "@user/controllers/get-profile";
import express, { Router } from "express";

class UserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get(
      "/user/all/:page",
      authMiddleware.checkAuthencation,
      Get.prototype.all
    );
    this.router.get(
      "/user/profile",
      authMiddleware.checkAuthencation,
      Get.prototype.profile
    );
    this.router.get(
      "/user/profile/:userId",
      authMiddleware.checkAuthencation,
      Get.prototype.profileByUserId
    );
    this.router.get(
      "/user/profile/posts/:username/:userId/:uId",
      authMiddleware.checkAuthencation,
      Get.prototype.profileAndPosts
    );

    return this.router;
  }
}

export const userRoutes: UserRoutes = new UserRoutes();
