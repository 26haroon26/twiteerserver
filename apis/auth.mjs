import express from "express";
import jwt from "jsonwebtoken";
import { userModel, otpModel } from "../database/model.mjs";
import { stringToHash, varifyHash } from "bcrypt-inzi";
import { customAlphabet } from "nanoid";
import SendEmail from "../forsendEmail/sendEmail.mjs";
import moment from "moment/moment.js";
const router = express.Router();
const SECRET = process.env.SECRET || "topsceret";

router.post("/signup", (req, res) => {
  let body = req.body;

  if (!body.firstName || !body.lastName || !body.email || !body.password) {
    res.status(400).send(
      `required fields missing, request example: 
                  {
                      "firstName": "John",
                      "lastName": "Doe",
                      "email": "abc@abc.com",
                      "password": "12345"
                  }`
    );
    return;
  }

  req.body.email = req.body.email.toLowerCase();

  userModel.findOne({ email: body.email }, (err, user) => {
    if (!err) {
      if (user) {
        // user already exist
        res.status(400).send({
          message: "user already exist,, please try a different email",
        });
        return;
      } else {
        // user not already exist
        // bcrypt hash technique isley ke ye one incryption he
        stringToHash(body.password).then((hashString) => {
          userModel.create(
            {
              firstName: body.firstName,
              lastName: body.lastName,
              email: body.email,
              password: hashString,
            },
            (err, result) => {
              if (!err) {
                res.status(201).send({ message: "user is created" });
              } else {
                res.status(500).send({ message: "internal server error" });
              }
            }
          );
        });
      }
    } else {
      res.status(500).send({ message: "db error in query" });
      return;
    }
  });
});

router.post("/login", (req, res) => {
  let body = req.body;

  if (!body.email || !body.password) {
    res.status(400).send(
      `required fields missing, request example: 
                  {
                      "email": "abc@abc.com",
                      "password": "12345"
                  }`
    );
    return;
  }
  req.body.email = req.body.email.toLowerCase();

  userModel.findOne(
    { email: body.email },
    "firstName lastName email password isVerified",
    (err, data) => {
      if (!err) {
        if (data) {
          varifyHash(body.password, data.password).then((isMatched) => {
            if (isMatched) {
              var token = jwt.sign(
                {
                  _id: data._id,
                  email: data.email,
                  iat: Math.floor(Date.now() / 1000) - 30,
                  exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
                },
                SECRET
              );

              res.cookie("Token", token, {
                maxAge: 86_400_000,
                httpOnly: true,
                sameSite: "none",
                secure: true,
              });

              res.send({
                message: "login successful",
                profile: {
                  firstName: data.firstName,
                  lastName: data.lastName,
                  email: data.email,
                  isVerified:data.isVerified,
                  _id: data._id,
                },
              });
              return;
            } else {
              res.status(401).send({ message: "Incorrect email or password" });
              return;
            }
          });
        } else {
          res.status(401).send({ message: "Incorrect email or password" });
          return;
        }
      } else {
        res.status(500).send({ message: "login failed, please try later" });
        return;
      }
    }
  );
});
router.post("/logout", (req, res) => {
  res.clearCookie("Token", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.send({ message: "Logout successful" });
});

router.post("/forget_password", async (req, res) => {
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
      .findOne({ email: body.email }, "firstName email password")
      .exec();
    if (!user) throw new Error("User not found");
    const nanoid = customAlphabet("1234567890", 5);
    const OTP = nanoid();

    await SendEmail({
      email: body.email,
      subject: `Froget paswword Email`,
      text: `Your OTP code is here \n\n ${OTP} \n\n Please Don't Share this code`,
    });
    const hashOTP = await stringToHash(OTP);
    otpModel.create({ otp: hashOTP, email: body.email });
    res.send({
      message: "OTP sent check email",
    });
    return;
  } catch (error) {
    res.status(500).send({ message: error });
  }
});

router.post("/check_otp", async (req, res) => {
  try {
    let body = req.body;
    body.email = body.email.toLowerCase();

    if (!body.otp || !body.new_password || !body.email) {
      res.status(400).send(
        `required fields missing, request example: 
                    {
                      "email": "abc@abc.com",
                      "otp": "12345",
                      "new_password":"hello123"
                     }`
      );
      return;
    }
    // otp he bh ya nahi
    const otpRecord = await otpModel
      .findOne({ email: body.email })
      .sort({ _id: -1 })
      .exec();

    // is se ek otp 2 bar use nahi hoge
    if (!otpRecord) throw new Error("Invalid OTP");
    if (otpRecord.isUsed) throw new Error("Invalid OTP");
    await otpModel.updateOne({ isUsed: true }).exec();

    // is se otp 5 minutes bad use nahi hoge
    const now = moment();
    const otpCreatedTime = moment(otpRecord.createdOn);
    const differenceInMin = now.diff(otpCreatedTime, "minutes");

    if (differenceInMin >= 5) throw new Error("Invalid OTP");

    const isMatched = await varifyHash(body.otp, otpRecord.otp);
    if (!isMatched) throw new Error("password is not match");

    const newhashPassword = await stringToHash(body.new_password);
    await userModel
      .updateOne({ email: body.email }, { password: newhashPassword })
      .exec();
    res.send({
      message: "password changed success",
    });
    return;
  } catch (error) {
    res.status(500).send({ message: error });
  }
});

export default router;
