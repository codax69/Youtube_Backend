import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiErrorHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { cloudinaryUpload } from "../utils/cloudinaryHandler.js";
import { jwt } from "json-web-token";

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
      `something went wrong while generate refresh and access Token..! ${error}`
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
    if (
      [username, fullName, email, password].some((field) => field.trim() === "")
    ) {
      throw new ApiError(401, "All Fields are Require..!");
    }
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
    const isValidPassword = await user.isPasswordCorrect(password);
    console.log(isValidPassword);
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
const logOutUser = asyncHandler(async (req, res, next) => {
  try {
    await User.findIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      {
        new: true,
      }
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .clearCookies("accessToken", options)
      .clearCookies("refreshToken", options)
      .json(200, {}, "User logOut successfully");
  } catch (error) {
    next(error);
  }
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  try {
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingToken) {
      throw new ApiError(400, "Unauthorized Request....!");
    }
    const verifyToken = jwt.verify(
      incomingToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(verifyToken._id);

    if (!user) {
      throw new ApiError(401, "Invalid Token..");
    }

    if (incomingToken !== user.refreshToken) {
      throw new ApiError(402, "refresh Token is used or expired");
    }
    const { accessToken, newRefreshToken } =
      await generateRefreshTokenAndAccessToken(user._id);
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "access token Refreshed"
      );
  } catch (error) {
    next(error);
  }
});
const getCurrentUser = asyncHandler(async (req, res, next) => {
  try {
    return res.status(200).json(200, req.user, "User fetched successfully..!");
  } catch (error) {
    next(error);
  }
});
const changePassword = asyncHandler(async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if ([oldPassword, newPassword].some((field) => field === "")) {
      throw new ApiError(401, "All Password Fields Are Require....!");
    }
    const user = await User.findById(user._id);
    const IsPasswordCorrect = user.isPasswordCorrect(oldPassword);
    if (!IsPasswordCorrect) {
      throw new ApiError(401, "Wrong OldPassword....!");
    }
    user.password = newPassword;
    user.save({ validBeforeSave: false });
    return res.status(200).json(200, {}, "Password Update Successfully....!");
  } catch (error) {
    next(error);
  }
});
const updateProfile = asyncHandler(async (req, res, next) => {
  //req.body
  //check body
  //db call and find and update user._id
  //remove password
  //return res
  const { email, fullName } = req.body;
  if (!email || !fullName) {
    throw new ApiError(401, "email or fullName fields Required...!");
  }
  const user = await User.findIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res.status(200).json(200, user, "Update Details Successfully...!");
});
const updateAvatar = asyncHandler(async(req,res,next)=>{
  try {
    const avatarLocalPath = req.file?.path
   if(!avatarLocalPath){
    throw new ApiError(401,"Avatar Image is Missing..!")
   }
   
   const avatarPath= await cloudinaryUpload(avatarLocalPath)
   if(!avatarPath.url){
    throw new ApiError(400,"Error while uploading on avatar")
   }
   const user = await User.findIdAndUpdate(
    req.user._id,{
      $set:{
        avatar:avatarPath.url
      }
      },{
        new:true
      }
   ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,user,"change avatar successfully...!"))
  } catch (error) {
    next(error)
  }
})
const updateCoverImage = asyncHandler(async(req,res,next)=>{
  try {
    const CoverImageLocalPath = req.file?.path
   if(!CoverImageLocalPath){
    throw new ApiError(401,"Avatar Image is Missing..!")
   }
   
   const CoverImagePath= await cloudinaryUpload(CoverImageLocalPath)
   if(!CoverImagePath.url){
    throw new ApiError(400,"Error while uploading on CoverImage")
   }
   const user = await User.findIdAndUpdate(
    req.user._id,{
      $set:{
        avatar:CoverImagePath.url
      }
      },{
        new:true
      }
   ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,user,"change CoverImage successfully...!"))
  } catch (error) {
    next(error)
  }
})
export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  getCurrentUser,
  changePassword,
  updateProfile,
  updateAvatar,
  updateCoverImage
};
