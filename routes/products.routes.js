const express = require("express");
const router = express.Router();

const { Op } = require("sequelize");
const { Products } = require("../models");

//인증 미들웨어
const authMiddleware = require("../middlewares/auth-middleware.js");

//모든 상품 조회
router.get("/products", async (req, res) => {
  const sortBy = req.query.sortBy || "createdAt";
  const sort =
    req.query.sort && req.query.sort.toLowerCase() === "desc" ? "DESC" : "ASC";

  const products = await Products.findAll({
    order: [[sortBy, sort]],
  });

  res.send(products);
});

// 상품 상세 조회
router.get("/product/:productId", async (req, res) => {
  const { productId } = req.params;

  const product = await Products.findByPk(productId, {
    attributes: ["productName", "productDesc", "userName", "state"],
  });

  try {
    if (!product) {
      res.status(400).send({ errorMessage: "상품 조회에 실패하였습니다." });
      return;
    }
    res.status(200).send(product);
  } catch (error) {
    console.log("Eror :", error);
    res.status(500).send({ errorMessage: "sever Error" });
  }
});

// 상품 생성 (인증 미들웨어 사용)
router.post("/product", authMiddleware, async (req, res) => {
  const { productName, productDesc } = req.body;
  const { email } = res.locals.user;

  const product = await Products.findOne({
    where: {
      [Op.or]: [{ productName }],
    },
  });
  //   let idCounter = await IdCounter.findOne({ model: "product9" });

  try {
    if (product) {
      res.status(400).send({ errorMessage: "상품이 이미 존재합니다." });
      return;
    }

    // if (!idCounter) {
    //   // 처음 등록할 경우 counter 생성
    //   await IdCounter.create({ model: "product9", count: 1 });
    //   console.log("test");
    // } else {
    //   // 이미 있다면 counter 증가
    //   idCounter.count++;
    //   await idCounter.save();
    // }
    // idCounter = await IdCounter.findOne({ model: "product9" });
    // const productsId = idCounter.count;

    const createProduct = await Products.create({
      productName: productName,
      productDesc: productDesc,
      userName: email,
    });

    res.status(200).send({ products: createProduct, Message: "save Success" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ errorMessage: error });
  }
});

router.delete("/product/:productId", authMiddleware, async (req, res) => {
  const { productId } = req.params;
  const { email } = res.locals.user;

  const product = await Products.findOne({
    where: {
      [Op.or]: [{ productId }],
    },
  });

  try {
    if (!product) {
      res.status(401).send({ errorMessage: "상품이 존재하는지 확인해주세요" });
      return;
    }

    if (product.userName !== email) {
      res
        .status(401)
        .send({ errorMessage: "본인이 작성한 글만 삭제가 가능합니다." });
      return;
    }

    await Products.deleteOne({
      where: {
        [Op.or]: [{ productId }],
      },
    });
    res.status(200).send({ Message: "삭제 되었습니다." });
  } catch (error) {
    console.log(error);
    res.status(400).send({ errorMessage: error });
  }
});

//상품 수정 (인증 미들웨어 사용)
router.put("/product/:productId", authMiddleware, async (req, res) => {
  const { productId } = req.params;
  const { productName, productDesc, state } = req.body;

  //res.locals.user 값 가져오기
  const { email } = res.locals.user;

  const product = await Products.findOne({
    where: {
      [Op.or]: [{ productId }],
    },
  });

  try {
    if (!product) {
      res.status(401).send({ errorMessage: "상품이 존재하는지 확인해주세요." });
      return;
    }

    if (product.userName !== email) {
      res
        .status(401)
        .send({ errorMessage: "본인이 작성한 글만 삭제가 가능합니다." });
      return;
    }

    await Products.updateOne(
      { productId: productId },
      {
        $set: {
          productName: productName,
          productDesc: productDesc,
          state: state,
        },
      }
    );

    const productResult = await Products.findOne({
      where: {
        [Op.or]: [{ productId }],
      },
    });

    res.status(200).send({ productResult });
  } catch (error) {
    console.log(error);
    res.status(400).send({ errorMessage: error });
  }
});

module.exports = router;
