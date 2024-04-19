import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiErrorHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { cloudinaryUpload } from "../utils/cloudinaryHandler.js";

const registerUser = asyncHandler(async (req, res, next) => {
  try {
    console.log("Received body:", req.body);
    const { username, email, fullName, password } = req.body;

    // Log each field to check what is received
    console.log(
      `Username: ${username}, Email: ${email}, Full Name: ${fullName}, Password: ${password}`,
    );

    if (
      [username, email, fullName, password].some(
        (field) => !field || field.trim() === "",
      )
    ) {
      console.error("One or more fields are empty after trimming.");
      return next(new ApiError(400, "All fields are required."));
    }

    const existUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existUser) {
      return next(
        new ApiError(409, "User with email and username already exists."),
      );
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (!avatarLocalPath) {
      return next(new ApiError(400, "Avatar file is required."));
    }

    let avatarUrl = "";
    try {
      const avatar = await cloudinaryUpload(avatarLocalPath);
       avatarUrl = avatar.path
    } catch (error) {
      console.error("Error during avatar upload:", error);
      return next(new ApiError(500, "Failed to upload avatar."));
    }

    let coverImageUrl = "";
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    if (coverImageLocalPath) {
      try {
        const coverImage = await cloudinaryUpload(coverImageLocalPath);
        coverImageUrl = coverImage[0]?.path;
      } catch (error) {
        return next(new ApiError(500, "Failed to upload cover image."));
      }
    }
    console.log(avatarUrl,coverImageUrl)

    const user = await User.create({
      fullName,
      email,
      password,
      username: username.toLowerCase(),
      avatar: avatarUrl.url,
      coverImage: coverImageUrl.url || "",
    });

    if (!user) {
      return next(
        new ApiError(500, "Something went wrong while registering the user."),
      );
    }

    res
      .status(201)
      .json(new ApiResponse(201, user, "User registered successfully."));
  } catch (error) {
    next(error);
  }
});

export { registerUser };
