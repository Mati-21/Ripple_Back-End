import createHttpError from "http-errors";
import { findUser, getUsers, updateProfile } from "../services/user.service.js";

export const getUser = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await findUser(userId);
    if (!user) {
      return next(createHttpError.NotFound("User not found"));
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const searchUser = async (req, res, next) => {
  try {
    const { value } = req.body;

    const users = await getUsers(value);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const uploadProfile = async (req, res, next) => {
  try {
    const { profile } = req.body;

    const userId = req.userId;
    const link = profile.profileLink;

    const updatedUser = await updateProfile(userId, link);
    res.status(200).json({ isloaded: true, updatedUser });
  } catch (error) {
    next(error);
  }
};

// Default values shown
