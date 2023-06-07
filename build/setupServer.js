"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatappServer = void 0;
const express_1 = require("express");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const compression_1 = __importDefault(require("compression"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
require("express-async-errors");
const socket_io_1 = require("socket.io");
const redis_1 = require("redis");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const config_1 = require("./config");
const routes_1 = __importDefault(require("./routes"));
const error_handler_1 = require("./shared/globals/helpers/error-handler");
// import { CustomError, IErrorResponse } from './shared/globals/helpers/error-handler';
const log = config_1.config.createLogger('server');
const SERVER_PORT = 5000;
class ChatappServer {
    constructor(app) {
        this.app = app;
    }
    start() {
        console.log("CONFIG", config_1.config.NODE_ENV);
        this.securityMiddleware(this.app);
        this.standardMiddleware(this.app);
        this.routeMiddleware(this.app);
        this.globalErrorHandler(this.app);
        this.startServer(this.app);
    }
    securityMiddleware(app) {
        console.log("CONFIG.node_env new updated.........", config_1.config.NODE_ENV === 'production');
        app.use((0, cookie_session_1.default)({
            name: 'session',
            keys: [config_1.config.SERVER_KEY_ONE, config_1.config.SERVER_KEY_TWO],
            maxAge: 24 * 60 * 60 * 1000,
            secure: config_1.config.NODE_ENV === 'production',
        }));
        app.use((0, hpp_1.default)());
        app.use((0, helmet_1.default)());
        app.use((0, cors_1.default)({
            origin: config_1.config.CLIENT_URL,
            credentials: true,
            optionsSuccessStatus: 200,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        }));
    }
    standardMiddleware(app) {
        app.use((0, compression_1.default)());
        app.use((0, express_1.json)({ limit: '50mb' }));
        app.use((0, express_1.urlencoded)({
            extended: true,
            limit: '50mb'
        }));
    }
    routeMiddleware(app) {
        (0, routes_1.default)(app);
    }
    globalErrorHandler(app) {
        app.all('*', (req, res) => {
            res.status(http_status_codes_1.default.NOT_FOUND).json({
                message: 'Not found'
            });
        });
        app.use((error, req, res, next) => {
            log.error(error);
            if (error instanceof error_handler_1.CustomError) {
                return res.status(error.statusCode).json(error.serializeErrors());
            }
            next();
        });
    }
    startServer(app) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const httpServer = new http_1.default.Server(app);
                const socketIO = yield this.createSocketIO(httpServer);
                this.socketIOConnections(socketIO);
                this.startHttpServer(httpServer);
            }
            catch (error) {
                log.error(error);
            }
        });
    }
    createSocketIO(httpServer) {
        return __awaiter(this, void 0, void 0, function* () {
            const io = new socket_io_1.Server(httpServer, {
                cors: {
                    origin: config_1.config.CLIENT_URL,
                    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                },
            });
            const pubClient = (0, redis_1.createClient)({ url: config_1.config.REDIS_HOST });
            const subClient = pubClient.duplicate();
            yield Promise.all([pubClient.connect(), subClient.connect()]);
            io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
            return io;
        });
    }
    startHttpServer(httpServer) {
        log.info(`Server running at with process ${process.pid}`);
        httpServer.listen(SERVER_PORT, () => {
            log.info(`Server is running on port ${SERVER_PORT}`);
        });
    }
    socketIOConnections(io) {
        log.info('socketIOConnections');
    }
}
exports.ChatappServer = ChatappServer;
// /Generate a function to add two numbers
