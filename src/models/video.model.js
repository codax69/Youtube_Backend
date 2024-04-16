import { Schema, mongoose } from "mongoose";
import { User } from "./user.model.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, //data form cloudinary
      require: [true, "Upload First videoFile"],
    },
    thumbnail: {
      type: String, //data form cloudinary
      require: [true, "Upload First videoFile"],
    },
    owner: {
      type: mongoose.types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      require: [true, "title is Require..!!!"],
    },
    desc: {
      type: String,
      require: [true, "description is Require..!!!"],
    },
    duration: {
      type: Number,
      require: true,
    },
    views: {
      type: Number,
      require: true,
    },
    isPublished: {
      type: Boolean,
    },
  },
  { timestamps: true },
);
mongoose.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema);
