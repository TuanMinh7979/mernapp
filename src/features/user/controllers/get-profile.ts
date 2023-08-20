import { Request, Response } from "express";
import HTTP_STATUS from "http-status-codes";
import { FollowerCache } from "@service/redis/follower.cache";
import { PostCache } from "@service/redis/post.cache";
import { UserCache } from "@service/redis/user.cache";
import { userService } from "@service/db/user.service";
import { followerService } from "@service/db/follower.service";
import mongoose from "mongoose";

import { IPostDocument } from "@post/interfaces/post.interface";
import { postService } from "@service/db/post.service";
import { IFollowerData } from "@root/features/follower/interfaces/follower.interface";
import { IAllUsers, IUserDocument } from "@user/interface/user.interface";
import { Helpers } from "@global/helpers/helper";

const PAGE_SIZE = 12;

interface IUserAll {
  newSkip: number;
  limit: number;
  skip: number;
  userId: string;
}
const userCache: UserCache = new UserCache();
const followerCache: FollowerCache = new FollowerCache();
const postCache: PostCache = new PostCache();
export class Get {
  //  * Params:
  //  * Res:number
  //   PRIVATE METHOD:
  private async usersCount(type: string): Promise<number> {
    //  ! Cache:
    // const totalUsers: number =
    //   type === "redis"
    //     ? await userCache.getTotalUsersInCache()
    //     : await userService.getTotalUsersInDB();
    // ! Service:
    const totalUsers = await userService.getTotalUsersInDB();
    return totalUsers;
  }
  //  * Params:
  //  * Res:IAllUsers
  //   PRIVATE METHOD:
  private async allUsers({
    newSkip,
    limit,
    skip,
    userId,
  }: IUserAll): Promise<IAllUsers> {
    let users;
    let type = "";
    //  ! Cache:
    // const cachedUsers: IUserDocument[] = (await userCache.getUsersFromCache(
    //   newSkip,
    //   limit,
    //   userId
    // )) as IUserDocument[];
    // const cachedUsers: IUserDocument[] = [];
    // if (cachedUsers.length) {
    //   type = "redis";
    //   users = cachedUsers;
    // } else {
    //   type = "mongodb";
    //   users = await userService.getAllUsers(userId, skip, limit);
    // }
    //  ! Services:
    users = await userService.getAllUsers(userId, skip, limit);

    const totalUsers: number = await Get.prototype.usersCount(type);
    return { users, totalUsers };
  }
  //  * Params:
  //  * Res:IFollowerData
  //   PRIVATE METHOD:
  private async followees(userId: string): Promise<IFollowerData[]> {
    //  ! Cache:
    // const cachedFollowers: IFollowerData[] =
    //   await followerCache.getFollowersFromCache(`followees:${userId}`);
    // const cachedFollowers: IFollowerData[] = [];
    // const result = cachedFollowers.length
    //   ? cachedFollowers
    //   : await followerService.getFollowerData(
    //       new mongoose.Types.ObjectId(userId)
    //     );

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
    const newSkip: number = skip === 0 ? skip : skip + 1;
    const allUsers = await Get.prototype.allUsers({
      newSkip,
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
    // ! Cache:
    // const cachedUser: IUserDocument = (await userCache.getUserFromCache(
    //   `${req.currentUser!.userId}`
    // )) as IUserDocument;

    // const existingUser: IUserDocument = cachedUser   ? cachedUser
    //   : await userService.getUserById(`${req.currentUser!.userId}`);
    //  ! Service: 
    const existingUser: IUserDocument = await userService.getUserById(
      `${req.currentUser!.userId}`
    );

    res
      .status(HTTP_STATUS.OK)
      .json({ message: "Get user profile", user: existingUser });
  }

  // * Params:
  // * Res:
  //    function my profile by userId
  public async profileByUserId(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    //  ! Cache:
    // const cachedUser: IUserDocument = (await userCache.getUserFromCache(userId)) as IUserDocument;
    // const existingUser: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(userId);
    //  ! Service: 
    const existingUser: IUserDocument = await userService.getUserById(userId);
    res
      .status(HTTP_STATUS.OK)
      .json({ message: "Get user profile by id", user: existingUser });
  }

  // * Params:
  // * Res:
  public async profileAndPosts(req: Request, res: Response): Promise<void> {
    const { userId, username, uId } = req.params;
    const userName: string = Helpers.firstLetterUppercase(username);
    //!  Cache:
    // const cachedUser: IUserDocument = (await userCache.getUserFromCache(
    //   userId
    // )) as IUserDocument;

    // const cachedUserPosts: IPostDocument[] =
    //   await postCache.getUserPostsFromCache("post", parseInt(uId, 10));

    // const existingUser: IUserDocument = cachedUser? cachedUser:
    //  ! Service:
    const existingUser: IUserDocument = await userService.getUserById(userId);
    //!  Cache:
    // const userPosts: IPostDocument[] = cachedUserPosts.length? cachedUserPosts:
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
    let randomUsers: IUserDocument[] = [];
    // ! Cache:
    // const cachedUsers: IUserDocument[] =
    //   await userCache.getRandomUsersFromCache(
    //     `${req.currentUser!.userId}`,
    //     req.currentUser!.username
    //   );
    // if (cachedUsers.length) {
    //   randomUsers = [...cachedUsers];
    // } else {
    // const users: IUserDocument[] = await userService.getRandomUsers(
    //   req.currentUser!.userId
    // );
    // randomUsers = [...users];
    // }
    //  ! Service:
    const users: IUserDocument[] = await userService.getRandomUsers(
      req.currentUser!.userId
    );
    randomUsers = [...users];
    res
      .status(HTTP_STATUS.OK)
      .json({ message: "User suggestions", users: randomUsers });
  }
}
