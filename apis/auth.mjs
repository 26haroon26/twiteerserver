import express from "express";
import jwt from "jsonwebtoken";
import { userModel, otpModel } from "../database/model.mjs";
import { stringToHash, varifyHash } from "bcrypt-inzi";
import { nanoid, customAlphabet } from "nanoid";
import nodemailer from "nodemailer";

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
      console.log("user: ", user);

      if (user) {
        // user already exist
        console.log("user already exist: ", user);
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
                console.log("user saved: ", result);
                res.status(201).send({ message: "user is created" });
              } else {
                console.log("db error: ", err);
                res.status(500).send({ message: "internal server error" });
              }
            }
          );
        });
      }
    } else {
      console.log("db error: ", err);
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
    "firstName lastName email password",
    (err, data) => {
      if (!err) {
        console.log("data: ", data);

        if (data) {
          varifyHash(body.password, data.password).then((isMatched) => {
            console.log("isMatched: ", isMatched);

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
                  _id: data._id,
                },
              });
              return;
            } else {
              console.log("user not found");
              res.status(401).send({ message: "Incorrect email or password" });
              return;
            }
          });
        } else {
          console.log("user not found");
          res.status(401).send({ message: "Incorrect email or password" });
          return;
        }
      } else {
        console.log("db error: ", err);
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
    // let _id = body.token._id;
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
    // console.log(OTP);

    let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: "lauryn9@ethereal.email",
        pass: "nPKtkNk5T5bCjSt3ay",
      },
    });
    let info = await transporter.sendMail({
      from: '"Muhammad Haroon 👻" <26haroon26@gmail.com>',
      to: "areebmuhammad96@gmail.com",
      subject: "Hello ✔",
      text: `Your OTP <br/>${OTP}`,
      html: "<b>Hello world?</b>",
    });

    console.log("Message sent: %s", info.messageId);
    res.json(info);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    const hashOTP = await stringToHash(OTP);
    otpModel.create({ otp: hashOTP, email: body.email });
    res.send({
      message: "OTP sent check email",
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

router.post("/check_otp", async (req, res) => {
  try {
    let body = req.body;
    if (!body.otpNumber || !body.new_password || !body.email) {
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
    const user = await userModel
      .findOne({ email: body.email }, "firstName email otp password")
      .exec();
    if (!user) throw new Error("User not found");
    const isMatched = await verifyOTP(body.otpNumber, user.otp);
    if (!isMatched) throw new Error("password is not match");
    const newhashPassword = await stringToHash(body.password);
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
