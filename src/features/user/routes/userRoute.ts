import { authMiddleware } from "@global/helpers/aurth-middleware";
import { Update } from "@user/controllers/change-password";
import { Get } from "@user/controllers/get-profile";
import { Search } from "@user/controllers/search-user";
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
    this.router.get(
      "/user/profile/user/suggestions",
      authMiddleware.checkAuthencation,
      Get.prototype.randomUserSuggestions
    );
    this.router.get(
      "/user/profile/search/:query",
      authMiddleware.checkAuthencation,
      Search.prototype.user
    );
    this.router.put(
      "/user/profile/change-password",
      authMiddleware.checkAuthencation,
      Update.prototype.password
    );

    return this.router;
  }
}

export const userRoutes: UserRoutes = new UserRoutes();
