import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiErrorHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { cloudinaryUpload } from "../utils/cloudinaryHandler.js";

// generate tokens using one method
const generateRefreshTokenAndAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.save({ validBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generate refresh and access Token..!"
    );
  }
};
const registerUser = asyncHandler(async (req, res, next) => {
  try {
    //? collect data form using req
    const { username, email, fullName, password } = req.body;
    // !Log each field to check what is received
    //! console.log(
    //!   `Username: ${username}, Email: ${email}, Full Name: ${fullName}, Password: ${password}`
    // !);
    //?check data is not a empty

    //?check exist user
    const existUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existUser) {
      return next(
        new ApiError(409, "User with email and username already exists.")
      );
    }
    //?req local path of avatar and cover Image
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    //! console.log(avatarLocalPath, coverImageLocalPath);
    //?check avatar file
    if (!avatarLocalPath) {
      return next(new ApiError(400, "Avatar file is required."));
    }
    //? upload avatar and cover images on cloudinary
    const avatar = await cloudinaryUpload(avatarLocalPath);
    const coverImage = await cloudinaryUpload(coverImageLocalPath);
    //! console.log(avatar, coverImage);
    //? crate user using userModel
    const user = await User.create({
      fullName,
      email,
      password,
      username: username.toLowerCase(),
      avatar: avatar.url,
      coverImage: coverImage.url || "",
    });
    //?user not a register throw error
    if (!user) {
      return next(
        new ApiError(500, "Something went wrong while registering the user.")
      );
    }
    // response on api using json
    return res
      .status(201)
      .json(new ApiResponse(201, user, "User registered successfully."));
  } catch (error) {
    next(error);
  }
});
const loginUser = asyncHandler(async (req, res, next) => {
  try {
    const { username, password, email } = req.body;

    // Validate input
    if (!username && !email) {
      throw new ApiError(401, "Username or Email is required.");
    }

    // Check user existence
    const user = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (!user) {
      throw new ApiError(401, "User does not exist.");
    }
    // Check password validity
    const isValidPassword = await user.isPasswordCorrect(password)
    console.log(isValidPassword)
    if (!isValidPassword) {
      throw new ApiError(401, "Password incorrect.");
    }

    // Generate tokens
    const { refreshToken, accessToken } =
      await generateRefreshTokenAndAccessToken(user._id);

    // Exclude password and refreshToken from the response
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // Set cookie options
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "strict", 
      
    };

    // Send response with cookies
    return res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .status(200)
      .json({
        message: "User logged in successfully",
        data: {
          loggedInUser,
          accessToken,
          refreshToken,
        },
      });
  } catch (error) {
    next(error);
  }
});

export { registerUser, loginUser };
