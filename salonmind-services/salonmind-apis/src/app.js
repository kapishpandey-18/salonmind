require("dotenv").config();
const express = require("express");
const cors = require("cors");

require("./config/env");
const requestLogger = require("./middleware/requestLogger");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const mountAuthModule = require("./modules/auth");
const mountOwnerModule = require("./modules/owner");

const app = express();

const allowedOrigins = [
  "http://localhost:3000", // salonmind-tenant-dashboard (tenant dashboard)
  "http://localhost:3010", // salonmind-admin
  "http://localhost:3020", // salon-employee (web dev)
  // add staging/prod domains later:
  // "https://admin.salonmind.com",
  // "https://app.salonmind.com",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, origin);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Branch-Id"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

mountAuthModule(app);
mountOwnerModule(app);
app.use("/api/salons", require("./routes/salons"));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
