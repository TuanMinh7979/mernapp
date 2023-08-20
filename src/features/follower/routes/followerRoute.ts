import { authMiddleware } from "@global/helpers/aurth-middleware";
import express, { Router } from "express";
import { Add } from "../controllers/follower-user";
import { Remove } from "../controllers/unfollow-user";
import { Get } from "../controllers/get-follow";
import { BlockUser } from "../controllers/block-user";

class FollowerRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    // get all someone's fan
    this.router.get(
      "/user/followers/:userId",
      authMiddleware.checkAuthencation,
      Get.prototype.userFollowers
    );
    // get all my idol
    this.router.get(
      "/user/following/",
      authMiddleware.checkAuthencation,
      Get.prototype.userFollowing
    );
    this.router.put(
      "/user/follow/:followeeId",
      authMiddleware.checkAuthencation,
      Add.prototype.follower
    );

    this.router.put(
      "/user/unfollow/:followeeId/:followerId",
      authMiddleware.checkAuthencation,
      Remove.prototype.follower
    );
    this.router.put(
      "/user/block/:otherId",
      authMiddleware.checkAuthencation,
      BlockUser.prototype.block
    );
    this.router.put(
      "/user/unblock/:otherId",
      authMiddleware.checkAuthencation,
      BlockUser.prototype.unblock
    );

    return this.router;
  }
}

export const followerRoutes: FollowerRoutes = new FollowerRoutes();
