const jwt = require("jsonwebtoken");
const { Users } = require("../models");

require("dotenv").config();

module.exports = async (req, res, next) => {
  const key = process.env.ACCESS_TOKEN_SECRET;
  const { authorization } = req.headers;
  const [authType, authToken] = (authorization ?? "").split(" ");

  console.log(authorization);

  // 인증 완료
  if (!authToken || authType !== "Bearer") {
    res.status(401).send({
      errorMessage: "로그인 후 이용 가능한 기능입니다.",
    });
    return;
  }

  try {
    // 요청 헤더에 저장된 토큰(req.headers.authorization)과 비밀키
    const { userId } = jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET);
    Users.findByPk(userId).then((user) => {
      res.locals.user = user;
      next();
    });
  } catch (error) {
    console.log(error);
    // 인증 실패
    // 유효시간이 초과된 경우
    if (error.name === "TokenExpiredError") {
      return res.status(419).json({
        code: 419,
        message: "토큰이 만료되었습니다.",
      });
    }
    // 토큰의 비밀키가 일치하지 않는 경우
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        code: 401,
        message: "유효하지 않은 토큰입니다.",
      });
    }
  }
};
