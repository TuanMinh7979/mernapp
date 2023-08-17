import { IReactionDocument } from "@root/features/reactions/interfaces/reaction.interface";
import { Server, Socket } from "socket.io";

export let socketIOPostObject: Server;
export class SocketIOPostHandler {
  private io: Server;
  constructor(io: Server) {
    this.io = io;
    socketIOPostObject = io;
  }

  public listen(): void {
    this.io.on("connection", (socket: Socket) => {
      socket.on("reaction", (reaction: IReactionDocument) => {
        console.log("-------------", reaction);
        
        this.io.emit('update reaction', reaction)
      });
      socket.on("comment", (reaction: IReactionDocument) => {
        this.io.emit('update comment', reaction)
      });
    });
  }
}
