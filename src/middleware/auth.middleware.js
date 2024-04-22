import  { asyncHandler } from "../utils/AsyncHandler.js";
import User from '../models/user.model.js'
import {ApiError} from '../utils/ApiErrorHandler.js'
import jwt from "json-web-token";
export const verifyJWT = asyncHandler(async (req, res, next) => {
   try {
     // request for cookies and headers
   const Token =  req.cookies?.accessToken|| req.header("Authorization")?.replace("Bearer","")
   //check cookies
   if(!Token){
     throw new ApiError(401,"Unauthorized request")
   }
   // decode access token using access token secret
  const decodedToken = jwt.verify(Token,process.env.ACCESS_TOKEN_SECRET)
  // call db and find user by id
  const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
  //check user
   if(!user){
     throw new ApiError(401,"Invalid Access Token")
   }
   // add req object using any name refer user and call next
   req.user = user
   next()
   } catch (error) {
    throw new ApiError(401,error?.message)
   }

});
