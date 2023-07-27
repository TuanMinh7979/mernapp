import { followWorker } from "@worker/follow.worker";
import { BaseQueue } from "./base.queue";
import { IFollowerJobData } from "@root/features/follower/interfaces/follower.interface";


class FollowQueue extends BaseQueue {
  constructor() {
    super('followers');
    this.processJob('addFollowToDB', 5, followWorker.addFollowerToDB);
    this.processJob('removeFollowFromDB', 5, followWorker.removeFollowerFromDB);
  }

  public addFollowJob(name: string, data: IFollowerJobData): void {
    this.addJob(name, data);
  }
}

export const followQueue: FollowQueue = new FollowQueue();