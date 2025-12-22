const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongo;

process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.ACCESS_TTL_ADMIN = "15m";
process.env.ACCESS_TTL_SALON_OWNER = "15m";
process.env.ACCESS_TTL_SALON_EMPLOYEE = "15m";
process.env.REFRESH_TTL_ADMIN = "30d";
process.env.REFRESH_TTL_SALON_OWNER = "30d";
process.env.REFRESH_TTL_SALON_EMPLOYEE = "30d";
process.env.ADMIN_ALLOWLIST_NUMBERS = "+15550000001";
process.env.OTP_TEST_CODE = "123456";
process.env.OTP_TTL_MS = `${5 * 60 * 1000}`;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) {
    await mongo.stop();
  }
});
