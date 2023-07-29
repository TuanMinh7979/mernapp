import { notificationQueue } from "@service/queue/notification.queue";
import { socketIONotificationObject } from "@socket/notification";
import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";

export class Update {
    // * Params:
    // * Res:
  public async notification(req: Request, res: Response): Promise<void> {
    const { notificationId } = req.params;
    //! Socket:
    socketIONotificationObject.emit("update notification", notificationId);
    //! Queue:
    notificationQueue.addNotificationJob("updateNotification", {
      key: notificationId,
    });
    res.status(HTTP_STATUS.OK).json({ message: "Notification marked as read" });
  }
}
