import { authRoutes } from "@auth/routes/authRoutes";
import { Application } from "express";

import { currentUserRoutes } from "@auth/routes/currentRoutes";
import { authMiddleware } from "@global/helpers/aurth-middleware";
import { serverAdapter } from "@service/queue/base.queue";
import { postRoutes } from "./features/post/routes/postRoutes";
import { reactionRoutes } from "./features/reactions/routes/reactionRoutes";
import { commentRoutes } from "@comment/routes/commentRoutes";
const BASE_PATH = "/api/v1";
export default (app: Application) => {
  const routes = () => {
    app.use("/queues", serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signoutRoute());

    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, reactionRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, commentRoutes.routes());
    
  };
  routes();
};
