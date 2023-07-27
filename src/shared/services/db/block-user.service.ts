import mongoose from "mongoose";
import { PushOperator } from "mongodb";
import { UserModel } from "@user/models/user.schema";

class BlockUserService {
  //* Params:
  //* userId:
  //* followerId:
  //* Res
  public async blockUser(userId: string, otherUserId: string): Promise<void> {
    console.log(userId, otherUserId);
    
    UserModel.bulkWrite([
      {
        updateOne: {
          filter: {
            // find current user
            _id: new mongoose.Types.ObjectId(userId),
            //and otherUserId haven't been blocked by this current user yet
            // TODO using $ne or $nin
            // blocked: { $ne: new mongoose.Types.ObjectId(otherUserId) },
          },
          update: {
            $push: {
              // add to [otherUser.block, otherUserId]
              blocked: new mongoose.Types.ObjectId(otherUserId),
            } as PushOperator<Document>,
          },
        },
      },
      
      
      {
        updateOne: {
          filter: {
            _id: new mongoose.Types.ObjectId(otherUserId),
            //and otherUserId haven't been blocked by this current user yet
            // TODO using $ne or $nin
            // blockedBy: { $ne: new mongoose.Types.ObjectId(userId) },
          },
          update: {
            $push: {
              // add to [otherUser.blockedBy, userId]
              blockedBy: new mongoose.Types.ObjectId(userId),
            } as PushOperator<Document>,
          },
        },
      },
    ]);
   
  }

  public async unblockUser(userId: string, otherUserId: string): Promise<void> {
    UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: {
            $pull: {
              // remove otherUserId  from blocked list in UserModel
              blocked: new mongoose.Types.ObjectId(otherUserId),
            } as PushOperator<Document>,
          },
        },
      },
      {
        updateOne: {
          filter: { _id: otherUserId },
          update: {
            $pull: {
              // remove current user id from blockedBy list in otherUserModel
              blockedBy: new mongoose.Types.ObjectId(userId),
            } as PushOperator<Document>,
          },
        },
      },
    ]);
  }
}

export const blockUserService: BlockUserService = new BlockUserService();
