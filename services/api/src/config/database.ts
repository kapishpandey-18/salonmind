import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async (): Promise<void> => {
  try {
    logger.info("Connecting to MongoDB...");

    const conn = await mongoose.connect(process.env.MONGODB_URI!);

    logger.success(`MongoDB Connected: ${conn.connection.host}`);
    logger.debug(`Database: ${conn.connection.name}`);
  } catch (error) {
    logger.error(
      "MongoDB connection error:",
      (error as Error).message
    );
    process.exit(1);
  }
};

export default connectDB;
