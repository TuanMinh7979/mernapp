import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { userService } from '@service/db/user.service';
import { Helpers } from '@global/helpers/helper';
import { ISearchUser } from '@user/interface/user.interface';


export class Search {
  public async user(req: Request, res: Response): Promise<void> {
    const regex = new RegExp(Helpers.escapeRegex(req.params.query), 'i');
    const users: ISearchUser[] = await userService.searchUsers(regex);
    res.status(HTTP_STATUS.OK).json({ message: 'Search results', search: users });
  }
}