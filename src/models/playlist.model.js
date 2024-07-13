import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
  {
    playlistName: {
      type: String,
      required: true,
    },
    playlistDesc: {
      type: String,
      required: true,
    },
    video: {
      type: mongoose.Schema.Types.objectId,
      ref: "Video",
    },
    owner: {
      type: mongoose.Schema.Types.objectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Playlist = mongoose.model("Playlist", playlistSchema);
export default Playlist;
