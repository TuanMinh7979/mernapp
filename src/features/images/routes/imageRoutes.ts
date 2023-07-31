import express, { Router } from "express";
import { authMiddleware } from "../../../shared/globals/helpers/aurth-middleware"
import { Add } from "@image/controllers/add-image";
import { Delete } from "@image/controllers/delete-image";
import { Get } from "@image/controllers/get-image";

class ImageRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/images/:userId', authMiddleware.checkAuthencation, Get.prototype.images);
    this.router.post(
      "/images/profile",
      authMiddleware.checkAuthencation,
      Add.prototype.profileImage
    );
    this.router.post(
      "/images/background",
      authMiddleware.checkAuthencation,
      Add.prototype.backgroundImage
    );
    this.router.delete('/images/:imageId', authMiddleware.checkAuthencation, Delete.prototype.image);
    this.router.delete('/images/background/:bgImageId', authMiddleware.checkAuthencation, Delete.prototype.backgroundImage);

    return this.router;
  }
}

export const imageRoutes: ImageRoutes = new ImageRoutes();
