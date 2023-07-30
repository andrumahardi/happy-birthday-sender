import express from "express";
import { UsersControllers } from "../controllers";

export const userRouter = express.Router();

userRouter.post("/send-email", UsersControllers.sendEmail)
userRouter.delete("/:id", UsersControllers.delete);

userRouter.post("/", UsersControllers.create);
userRouter.get("/", UsersControllers.findAll)
