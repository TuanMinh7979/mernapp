import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";


import { joiValidation } from "@global/decorators/joi-validation.decorators";
import { basicInfoSchema, changePasswordSchema, notificationSettingsSchema, socialLinksSchema } from "@user/schemes/info";

import { userService } from "@service/db/user.service";
import { IAuthDocument } from "@auth/interfaces/auth.interface";
import { BadRequestError } from "@global/helpers/error-handler";
import { authService } from "@service/db/auth.service";

export class Edit {


  // *Params:
  // *Res:
  // simple update
  public async updateBackgroundImage(req: Request, res: Response): Promise<void> {
    await userService.updateBackgroundImage(req.currentUser!.userId, req.body);
    res.status(HTTP_STATUS.OK).json({ message: "Updated successfully" });
  }
  @joiValidation(basicInfoSchema)
  public async info(req: Request, res: Response): Promise<void> {


    await userService.updateUserInfo(req.currentUser!.userId, req.body);
    res.status(HTTP_STATUS.OK).json({ message: "Updated successfully" });
  }
  // *Params:
  // *Res:
  @joiValidation(socialLinksSchema)
  public async social(req: Request, res: Response): Promise<void> {
    //  !　Service：
    await userService.updateSocialLinks(req.currentUser!.userId, req.body);
    res.status(HTTP_STATUS.OK).json({ message: "Updated successfully" });
  }

  @joiValidation(notificationSettingsSchema)
  public async notification(req: Request, res: Response): Promise<void> {

    //  ! Service:
    await userService.updateNotificationSettings(req.currentUser!.userId, req.body);
    res.status(HTTP_STATUS.OK).json({ message: 'Notification settings updated successfully', settings: req.body });
  }

  @joiValidation(changePasswordSchema)
  public async password(req: Request, res: Response): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      throw new BadRequestError("Passwords do not match.");
    }
    const existingUser: IAuthDocument = await authService.getAuthByUsername(
      req.currentUser!.username
    );
    const passwordsMatch: boolean = await existingUser.comparePassword(
      currentPassword
    );
    if (!passwordsMatch) {
      throw new BadRequestError("Invalid credentials");
    }
    const hashedPassword: string = await existingUser.hashPassword(newPassword);
    userService.updatePassword(`${req.currentUser!.username}`, hashedPassword);

    res.status(HTTP_STATUS.OK).json({
      message:
        "Password updated successfully. You will be redirected shortly to the login page.",
    });
  }


}
