import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiErrorHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { cloudinaryUpload } from "../utils/cloudinaryHandler.js";

const generateRefreshTokenAndAccessToken = async(userId) =>{
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.save({validBeforeSave : false})
    return {accessToken,refreshToken}

  } catch (error) {
    throw new ApiError(500,"something went wrong while generate refresh and access Token..!")
  }
}
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
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    console.log(avatarLocalPath, coverImageLocalPath);
    if (!avatarLocalPath) {
      return next(new ApiError(400, "Avatar file is required."));
    }
    const avatar = await cloudinaryUpload(avatarLocalPath);
    const coverImage = await cloudinaryUpload(coverImageLocalPath);
    console.log(avatar, coverImage);

    const user = await User.create({
      fullName,
      email,
      password,
      username: username.toLowerCase(),
      avatar: avatar.url,
      coverImage: coverImage.url || "",
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
const loginUser = asyncHandler(async (req, res) => {
  //get data
  //username or email
  //find user
  // check password
   const {username, email,password } = req.body
   if(!username || !email){
    throw new ApiError(409,"Username or Email are Required!!")
   }
   const user = await User.findOne({
    $or:[{username},{email}]
   })
   if(!user){
    throw new ApiError(404,"User dose not exist..!")
   }
   const isPasswordValid = await user.isPasswordCorrect(password)
   if(!isPasswordValid){
    throw new ApiError(401,"Incorrect Password..!")
   }
  
  const {accessToken,refreshToken}= await generateRefreshTokenAndAccessToken(user._id)
  

});
export { registerUser, loginUser };
