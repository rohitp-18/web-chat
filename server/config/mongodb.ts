import mongoose from "mongoose";

const mongodb = async () => {
  await mongoose
    .connect(process.env.MONGO_URL || "")
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((err) => {
      console.log("MongoDB connection error:", err);
    });
};

export default mongodb;
