
import express, { Router } from "express";
import { Check } from "./check";

class CheckRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get(
      "/check/online/:id",

      Check.prototype.checkUserOnline
    );

    return this.router;
  }
}

export const checkRoutes: CheckRoutes = new CheckRoutes();
