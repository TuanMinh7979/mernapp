import { IUserDocument } from "@user/interface/user.interface";
import { UserModel } from "@user/models/user.schema";

class UserService {
  public async addUserData(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }
}

export const userService: UserService = new UserService();
