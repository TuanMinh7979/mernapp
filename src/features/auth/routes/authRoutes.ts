import { authMiddleware } from "@global/middlewares/aurth-middleware";
import { SignIn } from "@auth/controllers/signin";
import { SignOut } from "@auth/controllers/signout";
import { SignUp } from "@auth/controllers/signup";
import express, { Router } from "express";
import { CurrentUser } from "@auth/controllers/current-user";

class AuthRoutes {
  private router: Router;
  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.post("/signup", SignUp.prototype.create);
    this.router.post("/signin", SignIn.prototype.read);
    this.router.post(
      "/signout",
      authMiddleware.verifyUser,
      SignOut.prototype.update
    );
    this.router.get(
      "/current-user",
      authMiddleware.verifyUser,
      CurrentUser.prototype.read
    );

    return this.router;
  }
}
export const authRoutes: AuthRoutes = new AuthRoutes();
