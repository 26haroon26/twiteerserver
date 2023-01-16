import express from "express";
import cookieParser from "cookie-parser";
import { userModel } from "../database/model.mjs";
import SendEmail from "../forsendEmail/sendEmail.mjs";

const router = express.Router();
router.use(cookieParser());

router.post("/check_my_email", async (req, res) => {
  try {
    let body = req.body;
    body.email = body.email.toLowerCase();

    if (!body.email) {
      res.status(400).send(
        `required fields missing, request example: 
                      {
                          "email": "abc@abc.com",
                       }`
      );
      return;
    }
    const user = await userModel
      .findOne(
        { email: body.email, isVerified: false },
        "firstName email password"
      )
      .exec();
    if (!user) throw new Error("User not found");

    await SendEmail({
      email: body.email,
      subject: `Email Verification`,
      text: "http://localhost:3000/api/v1/verify_my_email",
    });
    res.send({
      message: "check your email",
    });
    return;
  } catch (error) {
    res.status(500).send({ message: error });
  }
});

router.post("/verify_my_email", async (req, res) => {
  if (!req?.cookies?.Token) {
    res.status(401).send({
      message: "include http-only credentials with every request",
    });
    return;
  }
  jwt.verify(req.cookies.Token, SECRET,(err, decodedData) => {
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
     userModel
          .updateOne({ email: req.body.token.email },{},{ isVerified: true })
          .exec();

        res.send({ message: "youtr email is verified" });
      }
    } else {
      res.status(401).send("invalid token");
    }
  });
});
export default router;
