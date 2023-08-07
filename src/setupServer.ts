import { Application, json, urlencoded, Response, Request } from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import compresion from "compression";
import cookieSession from "cookie-session";
import HTTP_STATUS from "http-status-codes";
import "express-async-errors";
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

import { config } from "@root/config";
import applicationRoutes from "./routes";
import { NextFunction } from "express";
import Logger from "bunyan";
import { CustomError, IErrorResponse } from "@global/helpers/error-handler";
import { SocketIOPostHandler } from "@socket/post.socket";
import { SocketIOFollowerHandler } from "@socket/follower";
import { SocketIOUserHandler } from "@socket/user";
import { SocketIONotificationHandler } from "@socket/notification";
import { SocketIOImageHandler } from "@socket/image";
import { SocketIOChatHandler } from "@socket/chat";
// import { CustomError, IErrorResponse } from './shared/globals/helpers/error-handler';
const log: Logger = config.createLogger("server");
const SERVER_PORT = 5000;
export class ChatappServer {
  private app: Application;
  constructor(app: Application) {
    this.app = app;
  }
  public start(): void {
    console.log("CONFIG", config.NODE_ENV);

    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routeMiddleware(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }
  private securityMiddleware(app: Application): void {
    console.log(
      "CONFIG.node_env new updated.........",
      config.NODE_ENV === "production"
    );
    app.use(
      cookieSession({
        name: "session",
        keys: [config.SERVER_KEY_ONE!, config.SERVER_KEY_TWO!],
        maxAge: 24 * 60 * 60 * 1000,
        secure: config.NODE_ENV === "production",
      })
    );

    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      })
    );
  }
  private standardMiddleware(app: Application): void {
    app.use(compresion());
    app.use(json({ limit: "50mb" }));
    app.use(
      urlencoded({
        extended: true,
        limit: "50mb",
      })
    );
  }
  private routeMiddleware(app: Application): void {
    applicationRoutes(app);
  }
  private globalErrorHandler(app: Application): void {
    app.all("*", (req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "Not found",
      });
    });

    app.use(
      (
        error: IErrorResponse,
        req: Request,
        res: Response,
        next: NextFunction
      ) => {
        log.error(error);
        if (error instanceof CustomError) {
          return res.status(error.statusCode).json(error.serializeErrors());
        }
        next();
      }
    );
  }

  private async startServer(app: Application): Promise<void> {
 
    try {
      const httpServer = new http.Server(app);
      const socketIO: Server = await this.createSocketIO(httpServer);
      this.socketIOConnections(socketIO);
      this.startHttpServer(httpServer);
    } catch (error) {
      log.error(error);
    }
  }
  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
    });

    //redis
    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }
  private startHttpServer(httpServer: http.Server): void {
    log.info(`Server running at with process ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Server is running on port ${SERVER_PORT}`);
    });
  }

  private socketIOConnections(io: Server): void {
    const postSocketHandler: SocketIOPostHandler = new SocketIOPostHandler(io);

    const followerSocketHandler: SocketIOFollowerHandler =
      new SocketIOFollowerHandler(io);
    const userSocketHandler: SocketIOUserHandler = new SocketIOUserHandler(io);
    const chatSocketHandler: SocketIOChatHandler = new SocketIOChatHandler(io);
    const notificationSocketHandler: SocketIONotificationHandler =
      new SocketIONotificationHandler();
    const imageSocketHandler: SocketIOImageHandler = new SocketIOImageHandler();
    postSocketHandler.listen();
    followerSocketHandler.listen();
    userSocketHandler.listen();
    notificationSocketHandler.listen(io);
    imageSocketHandler.listen(io);
    chatSocketHandler.listen();
  }
}
// /Generate a function to add two numbers
