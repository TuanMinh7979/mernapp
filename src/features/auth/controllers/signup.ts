import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { signupSchema } from '@auth/schemes/signup';
import { authService } from '@service/db/auth,service';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { BadRequestError } from '@global/helpers/error-handler';

export class SignUp {
  @joiValidation(signupSchema)
  public async create({ req, res }: { req: Request; res: Response; }): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;
    const checkIfUserExists :IAuthDocument = await authService.getUserByUsernameOfEmail(username, email); //
  
    if(checkIfUserExists){
      throw new BadRequestError('Invalid credentials');
    }
  }

}