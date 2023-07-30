import express, { Express } from "express";
import { userRouter } from "./routes";
import { db } from "./db";
import dotenv from "dotenv";
import { connect } from "./services";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

db.sequelize.sync();

connect();

app.use(express.json())
app.use("/users", userRouter);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
