const express = require("express");
const router = express.Router();

const { Op } = require("sequelize");
const { Users } = require("../models");
const jwt = require("jsonwebtoken");

//비밀번호 암호화
const bcrypt = require("bcryptjs");

router.post("/users", async (req, res) => {
  const { email, nickname, password, confirmPassword } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  let regEmail = /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
  let pwRef = /^[a-zA-z0-9]{6,12}$/;

  const existsUsers = await Users.findAll({
    where: {
      [Op.or]: [{ email }, { nickname }],
    },
  });

  if (password !== confirmPassword) {
    res.status(400).send({
      errorMessage: "패스워드가 일치하지 않습니다.",
    });
    return false;
  }

  if (!regEmail.test(email)) {
    res.status(400).send({ errorMessage: "Email 형식을 확인해주세요." });
    return;
  }

  if (!pwRef.test(password)) {
    res.status(400).send({ errorMessage: "Password 형식을 확인해주세요." });
    return;
  }

  if (existsUsers.length) {
    res
      .status(400)
      .send({ errorMessage: "이메일 또는 닉네임이 사용중입니다. " });
    return;
  }

  try {
    await Users.create({
      email: email,
      nickname: nickname,
      password: hash,
    });
    res.status(201).send({ result: `${email}, ${nickname}` });
  } catch (error) {
    console.log(error);
    res.status(401).send({ errorMessage: error });
  }
});

router.post("/auth", async (req, res) => {
  const { email, password } = req.body;

  const user = await Users.findOne({
    where: {
      email,
    },
  });

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    res
      .status(400)
      .send({ errorMessage: "이메일 또는 패스워드를 확인해주세요!" });
    return;
  }

  const token = jwt.sign(
    { userId: user.userId },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "12h",
    }
  );

  //access token, Refresh Token ADD
  res.header("Authorization", `Bearer ${token}`);

  // token 값 전달 확인
  res.send({
    token: `Bearer ${token}`,
  });
});

const authMiddleware = require("../middlewares/auth-middleware.js");
router.get("/users/me", authMiddleware, async (req, res) => {
  const { email, nickname } = res.locals.user;

  return res.status(200).json({
    code: 200,
    message: "토큰이 정상입니다.",
    data: { email, nickname },
  });
});

module.exports = router;
