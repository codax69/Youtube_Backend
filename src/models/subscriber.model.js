import mongoose, { Schema } from "mongoose";
const subscriberSchema = new Schema(
  {
    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timeseries: true }
);
const Subscriber = mongoose.model("Subscriber", subscriberSchema);
export default Subscriber;
