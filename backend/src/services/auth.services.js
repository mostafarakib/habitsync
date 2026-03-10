import User from "../models/user.model.js";
import { ApiError, uploadOnCLoudinary } from "../utils/index.js";
import fs from "fs";

const registerUserService = async ({
  fullName,
  email,
  password,
  avatarLocalPath,
}) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, "User already exists with this email");
  }

  let avatarUrl = "";

  if (avatarLocalPath) {
    const uploadedAvatar = await uploadOnCLoudinary(avatarLocalPath);

    if (!uploadedAvatar) {
      throw new ApiError(500, "Failed to upload avatar. Please try again.");
    }

    avatarUrl = uploadedAvatar.secure_url;

    fs.unlinkSync(avatarLocalPath);
  }

  const user = await User.create({
    fullName,
    email,
    password,
    avatar: avatarUrl,
  });

  const createdUser = await User.findById(user._id).select("+password");

  const accessToken = createdUser.generateAccessToken();
  const refreshToken = createdUser.generateRefreshToken();

  createdUser.refreshToken = refreshToken;

  await createdUser.save({ validateBeforeSave: false });

  return {
    user: createdUser,
    accessToken,
    refreshToken,
  };
};

const loginUserService = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(400, "User not found with this email");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid email or password");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const logoutUserService = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    $set: { refreshToken: null },
  });
};

export { registerUserService, loginUserService, logoutUserService };
