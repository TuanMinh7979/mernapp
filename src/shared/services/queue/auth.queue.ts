import { IAuthDocument, IAuthJob } from "@auth/interfaces/auth.interface";
import { BaseQueue } from "./base.queue";
import { authWorker } from "@worker/auth.worker";

class AuthQueue extends BaseQueue {
  constructor() {
    super("auth");
    this.processJob('addAuthUserToDb', 5, authWorker.addAuthUsertoDB);
  }

  public addAuthUserJob(name: string, data: IAuthJob): void {
    this.addJob(name, data);
  }
}
export const authQueue: AuthQueue = new AuthQueue();
