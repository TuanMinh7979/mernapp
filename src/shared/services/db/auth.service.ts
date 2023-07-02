import { IAuthDocument } from "@auth/interfaces/auth.interface";
import { AuthModel } from "@auth/models/auth.schema";
import { Helpers } from "@global/helpers/helper";

class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }
  public async updatePasswordToken(
    authId: string,
    token: string,
    tokenExpiration: number
  ): Promise<void> {
    await AuthModel.updateOne(
      { _id: authId },
      {
        passwordResetToken: token,
        passwordResetExpires: tokenExpiration,
      }
    );
  }
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
  public async getAuthUserByUsername(username: string) {
    const user = await AuthModel.findOne({
      username: Helpers.firstLetterUppercase(username),
    }).exec();
    return user as IAuthDocument;
  }
  public async getAuthUserByEmail(email: string) {
    const user = await AuthModel.findOne({
      email: email,
    }).exec();
    return user as IAuthDocument;
  }
  public async getAuthUserByPasswordToken(token: string) {
    const user = await AuthModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    }).exec();
    return user as IAuthDocument;
  }
}

export const authService: AuthService = new AuthService();
