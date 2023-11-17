"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Products.init(
    {
      productId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      productName: DataTypes.STRING,
      productDesc: DataTypes.STRING,
      userName: DataTypes.STRING,
      state: { type: DataTypes.STRING, defaultValue: "FOR_SALE" },
    },
    {
      sequelize,
      modelName: "Products",
    }
  );
  return Products;
};
