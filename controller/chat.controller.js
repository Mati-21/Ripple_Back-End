import createHttpError from "http-errors";
import UserModel from "../models/user.model.js";
import ChatModel from "../models/chat.model.js";
import {
  chatCleaner,
  checkChatExist,
  findChats,
  updateChatMessages,
} from "../services/chat.service.js";
import MessageModel from "../models/message.model.js";

export const create_open_chat = async (req, res, next) => {
  try {
    const { receiver_id, isGroup } = req.body;
    const sender_id = req.userId;

    const isGroupChat =
      isGroup === true || (typeof isGroup === "string" && isGroup.length > 5);

    if (!isGroupChat) {
      if (!receiver_id) {
        throw createHttpError.BadRequest("Receiver ID is required");
      }

      const chatExist = await checkChatExist(sender_id, receiver_id, false);

      if (chatExist) {
        const cleanedChat = await chatCleaner(chatExist._id, sender_id);
        return res.status(200).json(cleanedChat);
      } else {
        const user = await UserModel.findById(receiver_id);
        if (!user) {
          throw createHttpError.NotFound("User not found");
        }

        let newChatData = {
          name: user.name,
          picture: user.picture,
          isGroup: false,
          users: [sender_id, receiver_id],
          admin: null,
          latestMessage: null,
        };

        const newChat = await ChatModel.create(newChatData);
        const populatedChat = await chatCleaner(newChat._id, sender_id);
        return res.status(200).json(populatedChat);
      }
    } else {
      // It's a group
      const groupChatExist = await checkChatExist("", "", isGroup);
      return res.status(200).json(groupChatExist);
    }
  } catch (error) {
    console.error("create_open_chat error:", error);
    next(error);
  }
};

export const getChats = async (req, res, next) => {
  try {
    const userId = req.userId;
    const chats = await findChats(userId);

    res.status(200).json(chats);
  } catch (error) {
    next(error);
  }
};

// controllers/chatController.js
export const markMessagesAsRead = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    await updateChatMessages(userId, chatId);
    const chats = await findChats(userId);

    res.status(200).json(chats);
  } catch (error) {
    next(error);
  }
};

export const createGroup = async (req, res, next) => {
  const { name, users } = req.body;
  users.push(req.userId);
  if (!name || !users) {
    throw createHttpError.BadRequest("something went wrong");
  }
  const groupChatData = {
    name,
    users,
    isGroup: true,
    picture: process.env.DEFAULT_PICTURE,
    admin: req.userId,
  };

  try {
    const newGroup = await ChatModel.create(groupChatData);
    console.log("new group", newGroup);
    const populatedGroupChat = await chatCleaner(newGroup._id, req.userId);
    res.status(200).json(populatedGroupChat);
  } catch (error) {
    next(error);
  }
};
