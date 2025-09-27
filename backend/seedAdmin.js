import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/userSchema.js";

dotenv.config({quiet: true});

const seedMainAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL,{
        dbName: process.env.DB_NAME
    });

    const existingAdmin = await User.findOne({ role: "MainAdmin" });

    if (existingAdmin) {
      console.log("MainAdmin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("123456789", 12);

    const admin = await User.create({
      username: "Ashish Sahani",
      email: "ashishsahani6392@gmail.com",
      password: hashedPassword,
      role: "MainAdmin",
      accountVerified: true,
      passwordUpdated: true,
      isActive: true,
    });

    console.log("MainAdmin seeded:", admin);
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedMainAdmin();
