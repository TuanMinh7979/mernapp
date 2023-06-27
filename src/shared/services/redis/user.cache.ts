import { StringMappingType } from "typescript";
import { BaseCache } from "./base.cache";
import { IUserDocument } from "@user/interface/user.interface";
export class UserCache extends BaseCache {

  constructor() {
    super('userCache');
  }

  public async saveUserToCache(key: string, u12Id: string, createdUser: IUserDocument): Promise<void> {
    const createdAt = new Date();
    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social
    } = createdUser;

    const firstList: string[] = [


      '_id', `${_id}`,
      'uId', `${uId}`,
      'username', `${username}`,
      'email', `${email}`,
      'avatarColor', `${avatarColor}`,
      'createdAt', `${createdAt}`,
      'postsCount', `${postsCount}`,



    ];
    const secondList: string[] = [
      'blocked', JSON.stringify(blocked),
      'blockedBy', JSON.stringify(blockedBy),
      'profilePicture', `${profilePicture}`,
      'followersCount', `${followersCount}`,
      'followingCount', `${followingCount}`,
      'notifications', JSON.stringify(notifications),
      'social', JSON.stringify(social),

    ]

    const thirdList: string[] = [
      'work', `${work}`,
      'location', `${location}`,
      'school', `${school}`,
      'quote', `${quote}`,
      'bgImageVersion', `${bgImageVersion}`,
      'bgImageId', `${bgImageId}`
    ]

    const dataToSave: string[] = [
      ...firstList, ...secondList, ...thirdList
    ]


    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.ZADD('users',
        {
          score: parseInt(u12Id, 10), value: `${key}`

        });

      await this.client.HSET(`users:${key}`, 'data', JSON.stringify(dataToSave));
    } catch (err) {
      console.log("-------error when save to redis", err)
    }

  }


}