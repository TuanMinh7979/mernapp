import { config } from "@root/config";

import Logger from "bunyan";
import { Server, Socket } from "socket.io";

export let socketIOFollowerObject: Server;
const log: Logger = config.createLogger("FollowerSocket");
export class SocketIOFollowerHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOFollowerObject = io;
  }
}
