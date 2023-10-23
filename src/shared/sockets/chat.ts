import { config } from "@root/config";
import Logger from "bunyan";
import { Server, Socket } from "socket.io";

export let socketIOChatObject: Server;
export const userOnRoom: Map<string, string> = new Map();
const log: Logger = config.createLogger("app");
export class SocketIOChatHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOChatObject = io;
  }

  public listen(): void {
    this.io.on("connection", (socket: Socket) => {
      socket.on("join room", (user) => {
        log.info(`user ${user} join room`);
        const { _id } = user;
        socket.join(_id);
      });

      //
      socket.on("join conversation", (data) => {
        const { userId, newConversationId } = data;
        userOnRoom.set(userId, socket.id);

        for (const room of socket.rooms) {
          if (room.startsWith("room_")) {
            socket.leave(room);
            log.info(`${socket.id} out of room ${room}`);
          }
        }

        if (newConversationId) {
          log.info("Join ConversationRoom: ", `room_${newConversationId}`);
          socket.join(`room_${newConversationId}`);
        }
      });
      socket.on("leave chat page", (data) => {
        const { userId } = data;
        userOnRoom.delete(userId);
        for (const room of socket.rooms) {
          if (room.startsWith("room_")) {
            socket.leave(room);
            log.info(`${socket.id} leave out of Conversation room ${room}`);
          }
        }
        log.info("leave chat page", userOnRoom);
      });

      socket.on("disconnect", () => {
        for (const [key, value] of userOnRoom) {
          if (value === socket.id) {
            userOnRoom.delete(key);
            break;
          }
        }

        log.info("---------------->>>disconnect<<<---------------", userOnRoom);
      });
    });
  }
}
