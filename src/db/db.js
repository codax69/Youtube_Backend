import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const ConnectDb = async () => {
  try {
    const connectionDB = await mongoose.connect(
      `${process.env.DB_URI || "mongodb+srv://prit9265:pritesh69@cluster0.tfe9svb.mongodb.net/"}/${DB_NAME}`,
    );
    console.log("Connected Host With:", connectionDB.connection.host);
  } catch (error) {
    console.log("DB Connection ERR:", error);
    process.exit(1);
  }
};
export default ConnectDb;
