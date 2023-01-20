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
      text: "https://eclectic-marzipan-999456.netlify.app/api/v1/verify_my_email",
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
  try {
    if (!req?.cookies?.Token)
      throw new Error("include http-only credentials with every request");
    jwt.verify(req.cookies.Token, SECRET, (err, decodedData) => {
      if (err) throw new Error("invalid token");

      const nowDate = new Date().getTime() / 1000;

      if (decodedData.exp < nowDate)
        throw new Error("token expired please login account again");
      req.body.token = decodedData;
      console.log(req.body.token);
    });
    userModel
      .updateOne({ _id: req.body.token._id }, { isVerified: true })
      .exec();
    res.send({ message: "your email is verified" });
  } catch (error) {
    res.status(500).send(error);
  }
});
export default router;
