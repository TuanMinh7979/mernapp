import express, { Express } from "express";
import { AppServer } from "./setupServer";
import databaseConnection from "./setupDatabase";
import { config } from "./config";
import Logger from "bunyan";

const log: Logger = config.createLogger("app");

class Application {
  public initialize() {
    this.loadConfig();
    databaseConnection();
    const app: Express = express();
    const server: AppServer = new AppServer(app);
    server.start();
  }

  private loadConfig() {
    config.validateConfig();
    config.cloudinaryConfig();
  }
}
const application: Application = new Application();
application.initialize();
