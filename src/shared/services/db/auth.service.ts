import { IAuthDocument } from "@auth/interfaces/auth.interface";
import { AuthModel } from "@auth/models/auth.schema";
import { Helpers } from "@global/helpers/helper";

class AuthService {
  public async getUserByUsernameOfEmail(
    username: string,
    email: string
  ): Promise<IAuthDocument> {
    const query = {
      $or: [
        { username: Helpers.firstLetterUppercase(username) },
        { email: email.toLowerCase() },
      ],
    };
    const user: IAuthDocument = (await AuthModel.findOne(
      query
    ).exec()) as IAuthDocument;
    return user;
  }

  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }
}

export const authService: AuthService = new AuthService();
