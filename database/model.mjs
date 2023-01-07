import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true },
  password: { type: String, required: true },
  createdOn: { type: Date, default: Date.now },
});
export const userModel = mongoose.model("Users", userSchema);

const tweetSchema = new mongoose.Schema({
  text: { type: String, required: true },
  owner: { type: mongoose.ObjectId, required: true },
  //ab direct hr post me name save kraden ge take querry na krne parhe
  // ownerName: String,
  // profilePhoto:String,
  // image:String,
  isDeleted: { type: Boolean, default: false },
  createdOn: { type: Date, default: Date.now },
});
const otpSchema = new mongoose.Schema({
  otp: { type: String },
  email: { type: String, required: true },
  createdOn: { type: Date, default: Date.now },
});
export const otpModel = mongoose.model("Otps", otpSchema);

export const tweetModel = mongoose.model("tweets", tweetSchema);

const mongodbURI =
  process.env.mongodbURI ||
  "mongodb+srv://abc:abc@cluster0.qgyid76.mongodb.net/tweetsdata?retryWrites=true&w=majority";

mongoose.set("strictQuery", false);
mongoose.connect(mongodbURI);
mongoose.connection.on("connected", function () {
  console.log("Mongoose is connected");
});

mongoose.connection.on("disconnected", function () {
  console.log("Mongoose is disconnected");
  process.exit(1);
});

mongoose.connection.on("error", function (err) {
  console.log("Mongoose connection error: ", err);
  process.exit(1);
});

process.on("SIGINT", function () {
  console.log("app is terminating");
  mongoose.connection.close(function () {
    console.log("Mongoose default connection closed");
    process.exit(0);
  });
});