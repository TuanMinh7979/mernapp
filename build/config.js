"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bunyan_1 = __importDefault(require("bunyan"));
const cloudinary_1 = __importDefault(require("cloudinary"));
class Config {
    constructor() {
        this.DEFAULT_DATABASE_URL = 'mongodb://localhost:27017/socicalapp';
        this.DATABASE_URL = process.env.DATABASE_URL || this.DEFAULT_DATABASE_URL;
        ;
        this.JWT_TOKEN = process.env.JWT_TOKEN || '1234';
        this.NODE_ENV = process.env.NODE_ENV || '';
        this.SERVER_KEY_ONE = process.env.SERVER_KEY_ONE || '';
        this.SERVER_KEY_TWO = process.env.SERVER_KEY_TWO || '';
        this.CLIENT_URL = process.env.CLIENT_URL || '';
        this.REDIS_HOST = process.env.REDIS_HOST || '';
        this.REDIS_HOST = process.env.CLOUD_NAME || '';
        this.REDIS_HOST = process.env.CLOUD_API_KEY || '';
        this.REDIS_HOST = process.env.CLOUD_API_SECRET || '';
    }
    createLogger(name) {
        return bunyan_1.default.createLogger({ name, level: 'debug' });
    }
    validateConfig() {
        for (const [key, value] of Object.entries(this)) {
            console.log("config key:", key, "value:", value);
            if (value === undefined) {
                throw new Error(`Configuration ${key} is undefined`);
            }
        }
    }
    cloudinaryConfig() {
        cloudinary_1.default.v2.config({
            cloud_name: this.CLOUD_NAME,
            api_key: this.CLOUD_API_KEY,
            api_secret: this.CLOUD_API_SECRET
        });
    }
}
;
exports.config = new Config();
