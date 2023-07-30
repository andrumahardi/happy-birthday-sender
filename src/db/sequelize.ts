import { Sequelize } from "sequelize";
import { UserModels } from "../models"
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize({
  database: process.env.DB_NAME || "",
  username: process.env.DB_USERNAME || "",
  password: process.env.DB_PASSWORD || "",
  host: process.env.DB_HOST || "",
  port: +(process.env.DB_PORT || 5432),
  dialect: "postgres"
});

export const db = {
  users: UserModels(sequelize),
  sequelize
}
