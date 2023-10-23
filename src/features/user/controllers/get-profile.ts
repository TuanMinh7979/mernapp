import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";

import { userService } from "@service/db/user.service";
import { followerService } from "@service/db/follower.service";
import mongoose from "mongoose";

import { IPostDocument } from "@post/interfaces/post.interface";
import { postService } from "@service/db/post.service";
import { IFollowerData } from "@root/features/follower/interfaces/follower.interface";
import { IAllUsers, IUserAuthDocument } from "@user/interface/user.interface";
import { Helpers } from "@global/helpers/helper";

const PAGE_SIZE = 8;

interface IUserAll {
  limit: number;
  skip: number;
  userId: string;
}

export class Get {
  //  * Params:
  //  * Res:number
  //   PRIVATE METHOD:
  private async usersCount(type: string): Promise<number> {
    // ! Service:
    const totalUsers = await userService.getTotalUsersInDB();
    return totalUsers;
  }
  //  * Params:
  //  * Res:IAllUsers
  //   PRIVATE METHOD:
  private async allUsers({

    limit,
    skip,
    userId,
  }: IUserAll): Promise<IAllUsers> {
    let users;
    let type = "";

    //  ! Services:
    users = await userService.getAllUsers(userId, skip, limit);

    const totalUsers: number = await Get.prototype.usersCount(type);
    return { users, totalUsers };
  }
  //  * Params:
  //  * Res:IFollowerData
  //   PRIVATE METHOD:
  private async followees(userId: string): Promise<IFollowerData[]> {
    //  ! Service:
    const result = await followerService.getFolloweeData(
      new mongoose.Types.ObjectId(userId)
    );
    return result;
  }
  // * Params:
  // * Res:

  public async all(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);

    const allUsers = await Get.prototype.allUsers({

      limit,
      skip,
      userId: `${req.currentUser!.userId}`,
    });
    const followees: IFollowerData[] = await Get.prototype.followees(
      `${req.currentUser!.userId}`
    );
    res.status(HTTP_STATUS.OK).json({
      message: "Get users",
      users: allUsers.users,
      totalUsers: allUsers.totalUsers,
      followees,
    });
  }

  // * Params:
  // * Res:
  //    function my profile
  public async profile(req: Request, res: Response): Promise<void> {
    //  ! Service:
    const existingUser: IUserAuthDocument =
      await userService.getUserAuthByUserId(`${req.currentUser!.userId}`);

    res
      .status(HTTP_STATUS.OK)
      .json({ message: "Get user profile", user: existingUser });
  }

  // * Params:
  // * Res:
  //    function my profile by userId
  public async profileByUserId(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    //  ! Service:
    const existingUser: IUserAuthDocument =
      await userService.getUserAuthByUserId(userId);
    res
      .status(HTTP_STATUS.OK)
      .json({ message: "Get user profile by id", user: existingUser });
  }

  // * Params:
  // * Res:
  public async profileAndPosts(req: Request, res: Response): Promise<void> {
    const { userId, username } = req.params;
    const userName: string = Helpers.firstLetterUppercase(username);
    //  ! Service:
    const existingUser: IUserAuthDocument =
      await userService.getUserAuthByUserId(userId);
    //  ! Service:
    const userPosts: IPostDocument[] = await postService.getPosts(
      { username: userName },
      0,
      100,
      {
        createdAt: -1,
      }
    );

    res.status(HTTP_STATUS.OK).json({
      message: "Get user profile and posts",
      user: existingUser,
      posts: userPosts,
    });
  }

  // * Params:
  // * Res:
  public async randomUserSuggestions(
    req: Request,
    res: Response
  ): Promise<void> {
    let randomUsers: IUserAuthDocument[] = [];

    //  ! Service:
    const users: IUserAuthDocument[] = await userService.getRandomUsers(
      req.currentUser!.userId
    );

    randomUsers = [...users];
    res
      .status(HTTP_STATUS.OK)
      .json({ message: "User suggestions", users: randomUsers });
  }
}
