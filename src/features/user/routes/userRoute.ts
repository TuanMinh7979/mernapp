import { authMiddleware } from '@global/helpers/aurth-middleware';
import { Get } from '@user/controllers/get-profile';
import express, { Router } from 'express';


class UserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/user/all/:page', authMiddleware.checkAuthencation, Get.prototype.all);
  
    return this.router;
  }
}

export const userRoutes: UserRoutes = new UserRoutes();