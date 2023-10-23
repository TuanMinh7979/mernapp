import { IAuthDocument } from "@auth/interfaces/auth.interface";
import { AuthModel } from "@auth/models/auth.schema";
import { Helpers } from "@global/helpers/helper";

class AuthService {

  public async create(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }
  
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


}

export const authService: AuthService = new AuthService();
