import express from "express";
import path from "path";
import cors from "cors";
import authApis from "./apis/auth.mjs";
import tweetApis from "./apis/tweet.mjs";
import changePassword from "./apis/changePassword.mjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { userModel } from "./database/model.mjs";

const SECRET = process.env.SECRET || "topsceret";
const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: [
      "https://eclectic-marzipan-999456.netlify.app",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", authApis);

app.use("/api/v1", (req, res, next) => {
  if (!req?.cookies?.Token) {
    res.status(401).send({
      message: "include http-only credentials with every request",
    });
    return;
  }
  jwt.verify(req.cookies.Token, SECRET, (err, decodedData) => {
    if (!err) {
      // console.log("decodedData: ", decodedData);

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
        // console.log("token approved");

        req.body.token = decodedData;
        next();
      }
    } else {
      res.status(401).send("invalid token");
    }
  });
});
app.use("/api/v1", tweetApis);

app.use("/api/v1",changePassword);

// ye function he jo do bar use ho ga

const getUser = async (req, res) => {
  let _id = "";
  if (req.params.id) {
    _id = req.params.id;
  } else {
    _id = req.body.token._id;
  }

  try {
    const user = await userModel
      .findOne({ _id: _id }, "email firstName lastName -_id")
      .exec();
    if (!user) {
      res.status(404).send({ message: "user not found" });
      return;
    } else {
      res.status(200).send(user);
    }
  } catch (error) {
    // console.log("error: ", error);
    res.status(500).send({
      message: "something went wrong on server",
    });
  }
};

app.get("/api/v1/profile", getUser);
app.get("/api/v1/profile/:id", getUser);



const __dirname = path.resolve();
app.use("/", express.static(path.join(__dirname, "./web/build")));
app.use("*", express.static(path.join(__dirname, "./web/build")));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
