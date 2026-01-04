import dotenv from 'dotenv';
dotenv.config();

console.log('MONGODB_URI:', process.env.MONGODB_URI);

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import dbConnect from "./lib/mongodb.js";


async function updatePassword(email, newPassword) {
  await dbConnect();

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.log("User not found");
    process.exit(1);
  }

  user.password = newPassword; // This will be hashed by the pre-save hook
  await user.save();

  console.log("Password updated successfully!");
  process.exit(0);
}

// CHANGE THESE:
const email = "admin@sheelwaterproofing.com";
const newPassword = "loltheblank@ronaldosaurav2";

updatePassword(email, newPassword); 