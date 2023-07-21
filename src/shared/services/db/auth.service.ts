import { IAuthDocument } from "@auth/interfaces/auth.interface";
import { AuthModel } from "@auth/models/auth.schema";
import { Helpers } from "@global/helpers/helper";

class AuthService {
  //   * Params:
  //   * data: data to save
  //   * Res: void
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }
  //   * Params:
  //   * authId: is auth._id
  //   * token: new token(for updating password) 
  //   * tokenExpiration: time for token
  //   * Res: void
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
  //   * Params:
  //   * username: 
  //   * email:
  //   * Res: AuthDocument
  public async getAuthByUsernameOrEmail(
    username: string,
    email: string
  ): Promise<IAuthDocument> {
    const query = {
      $or: [
        { username: Helpers.firstLetterUppercase(username) },
        { email: email.toLowerCase() },
      ],
    };
    const auth: IAuthDocument = (await AuthModel.findOne(
      query
    ).exec()) as IAuthDocument;
    return auth;
  }
  //   * Params:
  //   * username: 
  //   * Res: AuthDocument
  public async getAuthByUsername(username: string) {
    const auth = await AuthModel.findOne({
      username: Helpers.firstLetterUppercase(username),
    }).exec();
    return auth as IAuthDocument;
  }
  //   * Params:
  //   * email: 
  //   * Res: AuthDocument
  public async getAuthByEmail(email: string) {
    const auth = await AuthModel.findOne({
      email: email,
    }).exec();
    return auth as IAuthDocument;
  }
  //   * Params:
  //   * token: passwordResetToken 
  //   * Res: AuthDocument
  public async getAuthByPasswordToken(token: string) {
    const user = await AuthModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    }).exec();
    return user as IAuthDocument;
  }
}

export const authService: AuthService = new AuthService();
