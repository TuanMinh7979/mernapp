import mongoose from "mongoose";
import Logger from "bunyan";
import { config } from '@root/config';
import { redisConnection } from "@service/redis/redis.connection";

const log: Logger = config.createLogger("setupDatabase");
export default () => {
    const connect = () => {
        console.log("-----dburl -----", config.DATABASE_URL);
        mongoose.connect(`${config.DATABASE_URL}`)
            .then(() => {
                redisConnection.connect();
                log.info('Successfully connected to database')
            
            }).catch((err) => {
                log.error('-----------Error connecting', err);
                return process.exit(1);
            });
    }
    connect();
    mongoose.connection.on('disconnect', connect)
}