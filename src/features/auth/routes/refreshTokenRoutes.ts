
import express, { Router } from "express";
import { RefreshToken } from "@auth/controllers/refresh-token";

class RefreshTokenRoutes {
  private router: Router;
  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.get("/refresh_token", RefreshToken.prototype.read);
    return this.router;
  }
}
export const refreshTokenRoutes: RefreshTokenRoutes = new RefreshTokenRoutes();
