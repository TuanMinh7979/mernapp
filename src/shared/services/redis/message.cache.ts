import { BaseCache } from "@service/redis/base.cache";
import Logger from "bunyan";
import { findIndex, find, filter, remove } from "lodash";
import { config } from "@root/config";
import { ServerError } from "@global/helpers/error-handler";
import {
  IMessageData,
  IChatUsers,
  IChatList,
  IGetMessageFromCache,
} from "@chat/interfaces/chat.interface";
import { Helpers } from "@global/helpers/helper";
import { IReaction } from "@root/features/reactions/interfaces/reaction.interface";

const log: Logger = config.createLogger("messageCache");

export class MessageCache extends BaseCache {
  constructor() {
    super("messageCache");
  }
  // * Params:
  //  * Res:
  public async addChatListToCache(
    senderId: string,
    receiverId: string,
    conversationId: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userChatList = await this.client.LRANGE(
        `chatList:${senderId}`,
        0,
        -1
      );
      if (userChatList.length === 0) {
        //add data in the right
        await this.client.RPUSH(
          `chatList:${senderId}`,
          JSON.stringify({ receiverId, conversationId })
        );
      } else {
        // check receiver exist on list or not
        const receiverIndex: number = findIndex(
          userChatList,
          (listItem: string) => listItem.includes(receiverId)
        );
        if (receiverIndex < 0) {
          await this.client.RPUSH(
            `chatList:${senderId}`,
            JSON.stringify({ receiverId, conversationId })
          );
        }
      }
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }
  // * Params:
  // * Res:
  public async addChatMessageToCache(
    conversationId: string,
    value: IMessageData
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.RPUSH(
        `messages:${conversationId}`,
        JSON.stringify(value)
      );
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }
  // * Params:
  // * Res:
  public async addChatUsersToCache(value: IChatUsers): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const users: IChatUsers[] = await this.getChatUsersList();
      const usersIndex: number = findIndex(
        users,
        (listItem: IChatUsers) =>
          JSON.stringify(listItem) === JSON.stringify(value)
      );
      let chatUsers: IChatUsers[] = [];
      if (usersIndex === -1) {
        await this.client.RPUSH("chatUsers", JSON.stringify(value));
        chatUsers = await this.getChatUsersList();
      } else {
        chatUsers = users;
      }
      return chatUsers;
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }
  // * Params:
  // * Res:
  public async removeChatUsersFromCache(
    value: IChatUsers
  ): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const users: IChatUsers[] = await this.getChatUsersList();
      const usersIndex: number = findIndex(
        users,
        (listItem: IChatUsers) =>
          JSON.stringify(listItem) === JSON.stringify(value)
      );
      let chatUsers: IChatUsers[] = [];
      if (usersIndex > -1) {
        // if userIdx exist
        await this.client.LREM("chatUsers", usersIndex, JSON.stringify(value));
        chatUsers = await this.getChatUsersList();
      } else {
        chatUsers = users;
      }
      return chatUsers;
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }
  // * Params:
  // * Res:
  // function get all messages from all conversations
  public async getUserConversationList(key: string): Promise<IMessageData[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      // key is userId of user who sender image
      // rs is list of receiver userId and conversationId
      const userChatList: string[] = await this.client.LRANGE(
        `chatUsers:${key}`,
        0,
        -1
      );
      const conversationChatList: IMessageData[] = [];
      for (const item of userChatList) {
        const chatItem: IChatList = Helpers.parseJson(item) as IChatList;
        const lastMessage: string = (await this.client.LINDEX(
          `messages:${chatItem.conversationId}`,
          -1
        )) as string;
        conversationChatList.push(Helpers.parseJson(lastMessage));
      }
      return conversationChatList;
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }
  // * Params:
  // * Res:
  // function get all messages from 1 conversations
  public async getChatMessagesFromCache(
    senderId: string,
    receiverId: string
  ): Promise<IMessageData[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userChatList: string[] = await this.client.LRANGE(
        `chatList:${senderId}`,
        0,
        -1
      );
      const receiver: string = find(userChatList, (listItem: string) =>
        listItem.includes(receiverId)
      ) as string;
      const parsedReceiver: IChatList = Helpers.parseJson(
        receiver
      ) as IChatList;
      if (parsedReceiver) {
        const userMessages: string[] = await this.client.LRANGE(
          `messages:${parsedReceiver.conversationId}`,
          0,
          -1
        );
        const chatMessages: IMessageData[] = [];
        for (const item of userMessages) {
          const chatItem = Helpers.parseJson(item) as IMessageData;
          chatMessages.push(chatItem);
        }
        return chatMessages;
      } else {
        return [];
      }
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }
  // * Params:
  // * Res:
  // update in cache ís delete
  public async markMessageAsDeleted(
    senderId: string,
    receiverId: string,
    messageId: string,
    type: string
  ): Promise<IMessageData> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const { index, message, receiver } = await this.getMessage(
        senderId,
        receiverId,
        messageId
      );
      const chatItem = Helpers.parseJson(message) as IMessageData;
      if (type === "deleteForMe") {
        chatItem.deleteForMe = true;
      } else {
        chatItem.deleteForMe = true;
        chatItem.deleteForEveryone = true;
      }
      await this.client.LSET(
        `messages:${receiver.conversationId}`,
        index,
        JSON.stringify(chatItem)
      );
      // get the updated item
      const rs: string = (await this.client.LINDEX(
        `messages:${receiver.conversationId}`,
        index
      )) as string;
      return Helpers.parseJson(rs) as IMessageData;
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }
  // * Params:
  // * Res:
  // function to check all message object string item in messages:key list object as true
  public async updateChatMessages(
    senderId: string,
    receiverId: string
  ): Promise<IMessageData> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      // get conversationId
      const userChatList: string[] = await this.client.LRANGE(
        `chatList:${senderId}`,
        0,
        -1
      );
      const receiver: string = find(userChatList, (listItem: string) =>
        listItem.includes(receiverId)
      ) as string;
      const parsedReceiver: IChatList = Helpers.parseJson(
        receiver
      ) as IChatList;
      // get conversationId

      // get messages of conversation
      const messages: string[] = await this.client.LRANGE(
        `messages:${parsedReceiver.conversationId}`,
        0,
        -1
      );

      const unreadMessages: string[] = filter(
        messages,
        (listItem: string) => !Helpers.parseJson(listItem).isRead
      );

      for (const item of unreadMessages) {
        const messageStringObjectItem = Helpers.parseJson(item) as IMessageData;
        //* find index in List Object messsages:key
        const index = findIndex(messages, (listItem: string) =>
          listItem.includes(`${messageStringObjectItem._id}`)
        );
        messageStringObjectItem.isRead = true;
        // * use index to set it to list object messages:key again
        await this.client.LSET(
          `messages:${messageStringObjectItem.conversationId}`,
          index,
          JSON.stringify(messageStringObjectItem)
        );
      }
      //* get updated rs messages:key list object
      const lastMessage: string = (await this.client.LINDEX(
        `messages:${parsedReceiver.conversationId}`,
        -1
      )) as string;
      return Helpers.parseJson(lastMessage) as IMessageData;
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }
  // * Params:
  // * Res:
  public async updateMessageReaction(
    conversationId: string,
    messageId: string,
    reaction: string,
    senderName: string,
    type: "add" | "remove"
  ): Promise<IMessageData> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      // * get all messages item object string from messages:key List Object 
      const messages: string[] = await this.client.LRANGE(
        `messages:${conversationId}`,
        0,
        -1
      );
      // * find index of messageId string in list of messages object string
      const messageIndex: number = findIndex(messages, (listItem: string) =>
        listItem.includes(messageId)
      );
      //  * get item by index getted
      //  TODO: also can use filter
      const message: string = (await this.client.LINDEX(
        `messages:${conversationId}`,
        messageIndex
      )) as string;
      const parsedMessage: IMessageData = Helpers.parseJson(
        message
      ) as IMessageData;
      const reactions: IReaction[] = [];
      if (parsedMessage) {
        remove(
          parsedMessage.reaction,
          (reaction: IReaction) => reaction.senderName === senderName
        );
        if (type === "add") {
          // add more item(or replace old item by new item)
          reactions.push({ senderName, type: reaction });
          parsedMessage.reaction = [...parsedMessage.reaction, ...reactions];
          await this.client.LSET(
            `messages:${conversationId}`,
            messageIndex,
            JSON.stringify(parsedMessage)
          );
        } else {
          // set removed reaction message object string item 
          await this.client.LSET(
            `messages:${conversationId}`,
            messageIndex,
            JSON.stringify(parsedMessage)
          );
        }
      }
      // get updated data
      const updatedMessage: string = (await this.client.LINDEX(
        `messages:${conversationId}`,
        messageIndex
      )) as string;
      return Helpers.parseJson(updatedMessage) as IMessageData;
    } catch (error) {
      log.error(error);
      throw new ServerError("Server error. Try again.");
    }
  }
  // * Params:
  // * Res:
  private async getChatUsersList(): Promise<IChatUsers[]> {
    const chatUsersList: IChatUsers[] = [];
    const chatUsers = await this.client.LRANGE("chatUsers", 0, -1);
    for (const item of chatUsers) {
      const chatUser: IChatUsers = Helpers.parseJson(item) as IChatUsers;
      chatUsersList.push(chatUser);
    }
    return chatUsersList;
  }
  // * Params:
  // * Res:
  private async getMessage(
    senderId: string,
    receiverId: string,
    messageId: string
  ): Promise<IGetMessageFromCache> {
    // * get conversationId
    const userChatList: string[] = await this.client.LRANGE(
      `chatList:${senderId}`,
      0,
      -1
    );
    const receiver: string = find(userChatList, (listItem: string) =>
      listItem.includes(receiverId)
    ) as string;
    const parsedReceiver: IChatList = Helpers.parseJson(receiver) as IChatList;
    // getted conversationId
    //get all messages in this conversation
    const messages: string[] = await this.client.LRANGE(
      `messages:${parsedReceiver.conversationId}`,
      0,
      -1
    );

    const message: string = find(messages, (listItem: string) =>
      listItem.includes(messageId)
    ) as string;
    const index: number = findIndex(messages, (listItem: string) =>
      listItem.includes(messageId)
    );

    return { index, message, receiver: parsedReceiver };
  }
}
