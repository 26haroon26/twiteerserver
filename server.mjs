import express from "express";
import path from "path";
import cors from "cors";
import barrierForCheckLogin from "./apis/checkLogin.mjs"
import authApis from "./apis/auth.mjs";
import tweetApis from "./apis/tweet.mjs";
import checkEmailVerified from "./apis/checkEmail.mjs";
import checkUser from "./apis/getUser.mjs";
import changePassword from "./apis/changePassword.mjs";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT;

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
// for check login by token
app.use("/api/v1", barrierForCheckLogin);
app.use("/api/v1", checkUser);
app.use("/api/v1", tweetApis);
app.use("/api/v1", changePassword);
app.use("/api/v1", checkEmailVerified);

const __dirname = path.resolve();
app.use("/", express.static(path.join(__dirname, "./web/build")));
app.use("*", express.static(path.join(__dirname, "./web/build")));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
