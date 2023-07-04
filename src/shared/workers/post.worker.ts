import Logger from "bunyan";
import { config } from "@root/config";
import { DoneCallback, Job } from "bull";
import { postService } from "@service/db/post.service";
const log: Logger = config.createLogger("postWorker");
class PostWorker {
  async savePostToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await postService.addPostToDB(key, value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const postWorker: PostWorker = new PostWorker();