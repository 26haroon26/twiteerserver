import express from "express";
import jwt from "jsonwebtoken";

const SECRET = process.env.SECRET;
const router = express();

router.use((req, res, next) => {
  if (!req?.cookies?.Token) {
    res.status(401).send({
      message: "include http-only credential with every request",
    });
    return;
  }
  jwt.verify(req.cookies.Token, SECRET, (err, decodedData) => {
    if (!err) {
      const nowDate = new Date().getTime() / 1000;

      if (decodedData.exp < nowDate) {
        res.status(401).send({ message: "token expired" });
        res.cookie("Token", " ", {
          maxAge: 1,
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
      } else {
        req.body.token = decodedData;
        next();
      }
    } else {
      res.status(401).send("invalid token");
    }
  });
});

export default router;
