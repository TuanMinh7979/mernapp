import dotenv from "dotenv";
dotenv.config();
import bunyan from "bunyan";
import cloudinary from "cloudinary";
class Config {
  public ACCESS_TOKEN_SECRET: string | undefined;
  public ACCESS_TOKEN_EXP: string | undefined;

  public CLIENT_URL: string | undefined;
  public CLOUD_NAME: string | undefined;
  public CLOUD_API_KEY: string | undefined;
  public CLOUD_API_SECRET: string | undefined;

  public DATABASE_URL: string | undefined;

  public REFRESH_SECRET: string | undefined;
  public RF_TOKEN_EXP: string | undefined;
  public RF_TOKEN_EXP_TIME: string | undefined;

  constructor() {
    this.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "1234";
    this.ACCESS_TOKEN_EXP = process.env.ACCESS_TOKEN_EXP || "1234";

    this.CLIENT_URL = process.env.CLIENT_URL || "";
    this.CLOUD_NAME = process.env.CLOUD_NAME || "";
    this.CLOUD_API_KEY = process.env.CLOUD_API_KEY || "";
    this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET || "";

    this.DATABASE_URL = process.env.DATABASE_URL || "";

    this.REFRESH_SECRET = process.env.REFRESH_SECRET || "";
    this.RF_TOKEN_EXP = process.env.RF_TOKEN_EXP || "";
    this.RF_TOKEN_EXP_TIME = process.env.RF_TOKEN_EXP_TIME || "";
  }

  public createLogger(name: string): bunyan {
    return bunyan.createLogger({ name, level: "debug" });
  }

  public validateConfig(): void {
    console.log("CLIENT URL", this.CLIENT_URL);
    
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) {
        throw new Error(`Configuration ${key} is undefined`);
      }
    }
  }

  public cloudinaryConfig(): void {
    cloudinary.v2.config({
      cloud_name: this.CLOUD_NAME,
      api_key: this.CLOUD_API_KEY,
      api_secret: this.CLOUD_API_SECRET,
    });
  }
}
export const config: Config = new Config();
