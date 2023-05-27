import express, { Express } from 'express';
import { ChatappServer } from './setupServer';
import databaseConnection from './setupDatabase';
import {config} from './config';
class Application {
    public initialize() {
        this.loadConfig();
        databaseConnection()
        const app: Express = express();
        const server: ChatappServer = new ChatappServer(app);
        server.start();
    }

    private loadConfig() {
        config.validateConfig(); 
    }

}
const application: Application = new Application();
application.initialize();