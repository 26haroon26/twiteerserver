import express from "express";
import jwt from "jsonwebtoken";
import { userModel } from "../database/model.mjs";
import { stringToHash, varifyHash } from "bcrypt-inzi";

const router = express.Router();
const SECRET = process.env.SECRET || "topsceret";

// router.get('/profile', (req, res) => {
//   userModel.findOne({ email: req.body._decoded.email }, (err, user) => {

//       if (err) {
//           res.status(500).send("error in getting database")
//       } else {
//           if (user) {
//               res.send({
//                   name: user.name,
//                   email: user.email,
//                   _id: user._id,
//               });
//           } else {
//               res.send("user not found");
//           }
//       }
//   })
// })

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

  userModel.findOne({ email: body.email }, (err, data) => {
    if (!err) {
      console.log("data: ", data);

      if (data) {
        // user already exist
        console.log("user already exist: ", data);
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
                console.log("data saved: ", result);
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

  res.clearCookie("Token",{
    httpOnly: true,
    sameSite: 'none',
    secure: true
  });

  res.send({ message: "Logout successful" });
});



export default router;