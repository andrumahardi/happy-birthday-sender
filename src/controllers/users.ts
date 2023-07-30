import { Request, Response } from "express";
import { db } from "../db";
import { CONSTANTS } from "../constants";
import { format } from "date-fns";
import { Op } from "sequelize";
import axios from "axios";

const Users = db.users;
const instance = axios.create({
  baseURL: process.env.EXTERNAL_API_URL,
});

export class UsersControllers {
  static findAll(req: Request, res: Response) {
    let query = {};
    if (req.query.date && req.query.month) {
      query = {
        where: {
          [Op.and]: {
            dateOfBirth: req.query.date,
            monthOfBirth: {
              [Op.iLike]: req.query.month,
            },
          },
        },
      };
    }
    Users.findAll(query)
      .then((result) => {
        if (result) {
          let users = [];
          for (const key in result) {
            users.push(result[key]);
          }
          res.send({
            code: 200,
            users,
          });
        } else {
          res.send({
            code: 200,
          });
        }
      })
      .catch(() => {
        res.send({
          code: 500,
          message: CONSTANTS[500],
        });
      });
  }

  static create(req: Request, res: Response) {
    if (!req.body.birthdate)
      return res.send({
        code: 400,
        message: CONSTANTS[400],
      });

    Users.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      birthDate: req.body.birthdate,
      dateOfBirth: new Date(req.body.birthdate).getDate(),
      monthOfBirth: format(new Date(req.body.birthdate), "MMMM"),
      region: req.body.region,
      city: req.body.city,
    })
      .then((result) => {
        res.send({
          code: 200,
          message: CONSTANTS.CREATE_SUCCESS("user"),
          ...result.dataValues,
        });
      })
      .catch(() => {
        res.send({
          code: 500,
          message: CONSTANTS[500],
        });
      });
  }
  static delete(req: Request, res: Response) {
    Users.destroy({
      where: {
        id: req.params.id,
      },
    })
      .then((result) => {
        if (!result) throw new Error(CONSTANTS.NOT_FOUND);
        res.send({
          code: 200,
          message: CONSTANTS.DELETE_SUCCESS("user"),
        });
      })
      .catch((err) => {
        if (err.message === CONSTANTS.NOT_FOUND) {
          return res.send({
            code: 404,
            message: CONSTANTS[404],
          });
        }
        return res.send({
          code: 500,
          message: CONSTANTS[500],
        });
      });
  }
  static sendEmail(req: Request, res: Response) {
    instance
      .post("/send-email", {
        email: req.body.email,
        message: req.body.message,
      })
      .then(() => {
        console.log("SUCCESS SENT MESSAGE");
      })
      .catch(() => {
        setTimeout(() => {
          UsersControllers.sendEmail(req, res);
        }, 3e3);
      });
  }
}
