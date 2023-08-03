import { IAuthJob } from "@auth/interfaces/auth.interface";
import { BaseQueue } from "./base.queue";
import { userWorker } from "@worker/user.worker";

class UserQueue extends BaseQueue {
  constructor() {
    super("user");
    this.processJob('addUserToDB', 5, userWorker.addUserToDB);
    this.processJob('updateSocialLinksInDB', 5, userWorker.updateSocialLinks);
    this.processJob('updateBasicInfoInDB', 5, userWorker.updateUserInfo);
  }

  public addUserToDbJob(name: string, data: any): void {
    this.addJob(name, data);
  }
}
export const userQueue: UserQueue = new UserQueue();
