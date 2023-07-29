import { IAuthJob } from "@auth/interfaces/auth.interface";
import { BaseQueue } from "./base.queue";
import { IEmailJob } from "@user/interface/user.interface";
import { emailWorker } from "@worker/email.worker";

class EmailQueue extends BaseQueue {
  constructor() {
    super("emails");
    this.processJob('forgotPasswordEmail',5, emailWorker.addNotificationEmail )
    this.processJob('commentNotiEmail',5, emailWorker.addNotificationEmail )
    this.processJob('followNotiEmail',5, emailWorker.addNotificationEmail )
    this.processJob('reactionsEmail',5, emailWorker.addNotificationEmail )
  }

  public addEmailJob(name: string, data:IEmailJob): void {
    this.addJob(name, data);
  }
}
export const emailQueue: EmailQueue = new EmailQueue();
