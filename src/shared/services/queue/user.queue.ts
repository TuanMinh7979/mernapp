import { IAuthJob } from "@auth/interfaces/auth.interface";
import { BaseQueue } from "./base.queue";
import { userWorker } from "@worker/user.worker";

class UserQueue extends BaseQueue {
  constructor() {
    super("user");
    this.processJob("addUserToDb", 5, userWorker.addUserToDB);
  }

  public addUserToDbJob(name: string, data: any): void {
    this.addJob(name, data);
  }
}
export const userQueue: UserQueue = new UserQueue();
