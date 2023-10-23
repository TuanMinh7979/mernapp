import { authMiddleware } from "@global/middlewares/aurth-middleware";
import { Delete } from "@notification/controllers/delete-noti";
import { Get } from "@notification/controllers/get-noti";
import { Update } from "@notification/controllers/update-noti";
import express, { Router } from "express";

class NotificationRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get(
      "/notification",
      authMiddleware.checkAuthencation,
      Get.prototype.notifications
    );
    this.router.put(
      "/notification/:notificationId",
      authMiddleware.checkAuthencation,
      Update.prototype.notification
    );
    this.router.delete(
      "/notification/:notificationId",
      authMiddleware.checkAuthencation,
      Delete.prototype.notification
    );

    return this.router;
  }
}

export const notificationRoutes: NotificationRoutes = new NotificationRoutes();
