import { authMiddleware } from "@global/middlewares/aurth-middleware";
import { Get } from "@user/controllers/get-profile";
import { Search } from "@user/controllers/search-user";
import { Edit } from "@user/controllers/update";
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
      "/user/profile/posts/:username/:userId",
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
      "/user/profile/basic-info",
      authMiddleware.checkAuthencation,
      Edit.prototype.info
    );
    this.router.put(
      "/user/profile/social-links",
      authMiddleware.checkAuthencation,
      Edit.prototype.social
    );
    this.router.put(
      "/user/profile/settings",
      authMiddleware.checkAuthencation,
      Edit.prototype.notification
    );

    this.router.put(
      "/user/profile/change-password",
      authMiddleware.checkAuthencation,
      Edit.prototype.password
    );
    this.router.put(
      "/user/profile/background",
      authMiddleware.checkAuthencation,
      Edit.prototype.updateBackgroundImage
    );

    return this.router;
  }
}

export const userRoutes: UserRoutes = new UserRoutes();
