import { authRoutes } from "@auth/routes/authRoutes";
import { Application } from "express";

import { refreshTokenRoutes } from "@auth/routes/refreshTokenRoutes";
import { authMiddleware } from "@global/middlewares/aurth-middleware";

import { postRoutes } from "./features/post/routes/postRoutes";
import { reactionRoutes } from "./features/reactions/routes/reactionRoutes";
import { commentRoutes } from "@comment/routes/commentRoutes";
import { followerRoutes } from "./features/follower/routes/followerRoute";
import { notificationRoutes } from "@notification/routes/notificationRoutes";
import { imageRoutes } from "@image/routes/imageRoutes";
import { chatRoutes } from "@chat/routes/chatRoutes";
import { userRoutes } from "@user/routes/userRoute";
import { healthRoutes } from "@user/routes/healthRoute";
import { checkRoutes } from "./features/check/check/checkRoute";
const BASE_PATH = "/api/v1";
export default (app: Application) => {
  const routes = () => {
    app.use("", healthRoutes.health());

    app.use(BASE_PATH, authRoutes.routes());

    app.use(BASE_PATH, refreshTokenRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, reactionRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, commentRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, followerRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, notificationRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, imageRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, chatRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, userRoutes.routes());
  };
  routes();
};
