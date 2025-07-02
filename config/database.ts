import mongoose from "mongoose";

export const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to database successfully!");
  } catch (error) {
    console.log("Error connecting to database:");
    console.log(error);
  }
}