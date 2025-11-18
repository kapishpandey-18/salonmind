require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const logger = require("./utils/logger");
const requestLogger = require("./middleware/requestLogger");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Initialize express
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom request logger
app.use(requestLogger);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/salons", require("./routes/salons"));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler - must be after all routes
app.use(notFound);

// Global error handler - must be last
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.success(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(
    `Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
  );
});
