import dotenv from 'dotenv'
import express from "express";
import ConnectDB from "./db/db.js";
dotenv.config({
    path:"./env"
})
const app = express();
ConnectDB();
app.listen(process.env.PORT)
