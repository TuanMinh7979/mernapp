import { authRoutes } from "@auth/routes/auth.route";
import { Application } from "express";
import { serverAdapter } from "./shared/queue/base.queue";
const BASE_PATH = "/api/v1";
export default (app: Application) => {
  const routes = () => {
    app.use("/queues", serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
  };
  routes();
};
