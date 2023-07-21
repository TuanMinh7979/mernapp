import { authMiddleware } from "@global/helpers/aurth-middleware";
import express, { Router } from "express";
import { Add } from "../controllers/follower-user";

class FollowerRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.put(
      "/user/follow/:followeeId",
      authMiddleware.checkAuthencation,
      Add.prototype.follower
    );

    return this.router;
  }
}

export const followerRoutes: FollowerRoutes = new FollowerRoutes();
