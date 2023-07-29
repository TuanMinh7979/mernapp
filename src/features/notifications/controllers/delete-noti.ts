import { notificationQueue } from "@service/queue/notification.queue";
import { socketIONotificationObject } from "@socket/notification";
import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";

export class Delete {
  public async notification(req: Request, res: Response): Promise<void> {
    const { notificationId } = req.params;
    //! Socket:
    socketIONotificationObject.emit("delete notification", notificationId);
    //! Queue:
    notificationQueue.addNotificationJob("deleteNotification", {
      key: notificationId,
    });
    res
      .status(HTTP_STATUS.OK)
      .json({ message: "Notification deleted successfully" });
  }
}
