import { DataTypes, Sequelize } from "sequelize";

export const UserModels = (sequelize: Sequelize) => {
  return sequelize.define("Users", {
    firstName: {
      type: DataTypes.STRING,
    },
    lastName: {
      type: DataTypes.STRING,
    },
    dateOfBirth: {
      type: DataTypes.INTEGER,
    },
    monthOfBirth: {
      type: DataTypes.STRING,
    },
    birthDate: {
      type: DataTypes.DATE,
    },
    region: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
  });
};
