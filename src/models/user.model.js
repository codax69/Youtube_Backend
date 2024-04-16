import { Schema, mongoose } from "mongoose";
import { Video } from "./video.model.js";
import bcrypt from "bcrypt";
import jwt from "json-web-token";

const userSchema = new Schema(
  {
    username: {
      type: String,
      require: [true, "Username is Require!!"],
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      require: [true, "Email is Require!!"],
      unique: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      require: [true, "username is Require!!"],
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // data form Cloudinary
      require: [true, "Avatar is Require!!"],
    },
    coverImage: {
      type: String,
    },
    password: {
      type: String,
      require: [true, "Password is Require"],
    },
    watchHistory: {
      type: mongoose.Types.ObjectId,
      ref: "Video",
    },
  },
  { timestamps: true },
);
mongoose.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
  };
  mongoose.methods.generateAccessToken = async function () {
    return jwt.sign(
      {
        _id: this.id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      },
    );
  };
  mongoose.methods.generateRefreshToken = async function () {
    return jwt.sign(
      {
        _id: this.id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      },
    );
  };
});

export const User = mongoose.model("User", userSchema);
