import { ILogin, IBlockSocketData } from "@user/interface/user.interface";
import { Server, Socket } from "socket.io";

export let socketIOUserObject: Server;

export class SocketIOUserHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOUserObject = io;
  }

  public listen(): void {
    this.io.on("connection", (socket: Socket) => {
      // blockedUser: target._id,
      //   blockedBy: logged?._id
      socket.on("block user", (data: IBlockSocketData) => {
        this.io.emit("blocked user id", data);
      });

      socket.on("unblock user", (data: IBlockSocketData) => {
        this.io.emit("unblocked user id", data);
      });
    });
  }
}
