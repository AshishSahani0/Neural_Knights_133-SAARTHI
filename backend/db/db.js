import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({quiet:true});

const connectDB = async () => {
    const MONGODB_URL = process.env.MONGODB_URL;
    try {
        await mongoose.connect(MONGODB_URL,{
            dbName: process.env.DB_NAME
        })
        console.log("DB connected successfully");
    } catch (error) {
        console.log("Error in DB connection", error);
        process.exit(1);
    }

}

export default connectDB;