import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, "../../.env") });

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campuscare";
if (!/^mongodb(\+srv)?:\/\//i.test(mongoUri)) {
  throw new Error("MONGODB_URI must start with mongodb:// or mongodb+srv://.");
}

const required = ["MONGODB_URI", "JWT_SECRET"];
for (const name of required) {
  if (!process.env[name] && process.env.NODE_ENV === "production") {
    throw new Error(`${name} must be configured in production.`);
  }
}

export const config = {
  port: Number(process.env.PORT || 5000),
  mongoUri,
  jwtSecret: process.env.JWT_SECRET || "development-only-secret-change-me",
  adminUsername: "pccoe",
  adminPassword: "123456789",
  clientUrl: process.env.CLIENT_URL || null,
  isProduction: process.env.NODE_ENV === "production"
};
