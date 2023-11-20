require("dotenv").config();
const express = require("express");
const app = express();
const userRouter = require("./routes/users.routes.js");
const productRouter = require("./routes/products.routes.js");

const port = process.env.PORT;

// sequelize connect
const { sequelize } = require("./models");

const ConnectDB = async () => {
  try {
    await sequelize
      .authenticate()
      .then(() => console.log("데이터베이스 연결 성공!"));
    await sequelize.sync().then(() => console.log("동기화 완료!"));
  } catch (error) {
    console.error("DB 연결 및 동기화 실패", error);
  }
};

//DB 연결 및 동기화
ConnectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", [userRouter, productRouter]);

app.get("/", (req, res) => {
  res.send("hello");
});

app.listen(port, () => {
  console.log(port, "번호가 연결 되었습니다.");
});
