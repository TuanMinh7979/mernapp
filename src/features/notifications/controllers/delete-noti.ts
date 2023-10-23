import { socketIONotificationObject } from "@socket/notification";
import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
import { notificationService } from "@service/db/notification.service";
export class Delete {
  public async notification(req: Request, res: Response): Promise<void> {
    const { notificationId } = req.params;
    //! Socket:
    socketIONotificationObject
      .to(req?.currentUser?.userId as string)
      .emit("deleted notification", notificationId);
    await notificationService.deleteNotification(notificationId);
    res
      .status(HTTP_STATUS.OK)
      .json({ message: "Notification deleted successfully" });
  }
}
