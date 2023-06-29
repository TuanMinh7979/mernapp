import { authRoutes } from "@auth/routes/authRoutes";
import { Application } from "express";
import { serverAdapter } from "./shared/queue/base.queue";
import { currentUserRoutes } from "@auth/routes/currentRoutes";
const BASE_PATH = "/api/v1";
export default (app: Application) => {
  const routes = () => {
    app.use("/queues", serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signoutRoute());
    
    app.use(BASE_PATH, currentUserRoutes.routes())
  };
  routes();
};
