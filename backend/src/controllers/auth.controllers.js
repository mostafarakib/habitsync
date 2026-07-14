import {
  loginUserService,
  logoutUserService,
  registerUserService,
} from "../services/auth.services.js";
import { ApiResponse, asyncHandler } from "../utils/index.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const cookieOptionsWithExpiry = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  const avatarLocalPath = req.file?.path;

  const { user, accessToken, refreshToken } = await registerUserService({
    fullName,
    email,
    password,
    avatarLocalPath,
  });

  return res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptionsWithExpiry)
    .cookie("refreshToken", refreshToken, cookieOptionsWithExpiry)
    .json(new ApiResponse(201, "User registered successfully", user));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await loginUserService({
    email,
    password,
  });

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptionsWithExpiry)
    .cookie("refreshToken", refreshToken, cookieOptionsWithExpiry)
    .json(new ApiResponse(200, "User logged in successfully", user));
});

const logoutUser = asyncHandler(async (req, res) => {
  await logoutUserService(req.user._id);

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, "User logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user; // Assuming the user is attached to the request by the verifyJWT middleware

  if (!user) {
    return res
      .status(404)
      .json(new ApiResponse(404, "User not found. Please log in again."));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Current user retrieved successfully", user));
});

export { registerUser, loginUser, logoutUser, getCurrentUser };
