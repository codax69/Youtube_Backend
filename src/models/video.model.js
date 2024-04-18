import { Schema, mongoose } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, //data form cloudinary
      required: [true, "Upload First videoFile"],
    },
    thumbnail: {
      type: String, //data form cloudinary
      required: [true, "Upload First videoFile"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "title is Require..!!!"],
    },
    desc: {
      type: String,
      required: [true, "description is Require..!!!"],
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      required: true,
    },
    isPublished: {
      type: Boolean,
    },
  },
  { timestamps: true },
);
mongoose.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema);
