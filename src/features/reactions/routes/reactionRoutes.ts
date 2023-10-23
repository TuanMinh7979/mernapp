import { authMiddleware } from "@global/middlewares/aurth-middleware";
import express, { Router } from "express";
import { Add } from "../controllers/add-reaction";
import { Remove } from "../controllers/remove-reaction";
import { Get } from "../controllers/get-reactions";

class ReactionRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get(
      "/post/reactions/:postId",
      authMiddleware.checkAuthencation,
      Get.prototype.reactions
    );
    this.router.get(
      "/post/single/reactions/username/:username/:postId",
      authMiddleware.checkAuthencation,
      Get.prototype.singleReactionByUsername
    );
    this.router.get(
      "/post/reactions/username/:username",
      authMiddleware.checkAuthencation,
      Get.prototype.reactionsByUsername
    );


    this.router.post(
      "/post/reaction",
      authMiddleware.checkAuthencation,
      Add.prototype.reaction
    );
    this.router.delete(
      "/post/reaction/:postId/:previousReaction/:postReactions", 
      authMiddleware.checkAuthencation,
      Remove.prototype.reaction
    );

    return this.router;
  }
}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes();
