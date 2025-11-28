import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Support both DATABASE_URL and individual credentials
const databaseUrl = process.env.DATABASE_URL;

let sequelize: Sequelize;

if (databaseUrl) {
  // Use DATABASE_URL if provided (production with Render/Supabase)
  sequelize = new Sequelize(databaseUrl, {
    dialect: "postgres",
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
    dialectOptions: {
      ssl: process.env.NODE_ENV === "production" ? {
        require: false,
        rejectUnauthorized: false
      } : false
    }
  });
} else {
  // Use individual credentials (development)
  const dbHost = process.env.DB_HOST || "localhost";
  const dbPort = parseInt(process.env.DB_PORT || "5432", 10);
  const dbName = process.env.DB_NAME || "treasure_hunt";
  const dbUser = process.env.DB_USER || "postgres";
  const dbPassword = process.env.DB_PASSWORD || "postgres";

  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: "postgres",
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
}

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
