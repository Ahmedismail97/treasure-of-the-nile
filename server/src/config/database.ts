import { Sequelize } from "sequelize";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const dbPath =
  process.env.DB_PATH ||
  path.join(__dirname, "../../database/treasure_hunt.db");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Test connection
export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log("✓ Database connection established successfully");
    return true;
  } catch (error) {
    console.error("✗ Unable to connect to database:", (error as Error).message);
    return false;
  }
};

export { sequelize };
