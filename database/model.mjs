import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true },
  password: { type: String, required: true },
  createdOn: { type: Date, default: Date.now },
});
export const userModel = mongoose.model("Users", userSchema);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: Number,
  description: String,
  owner: { type: mongoose.ObjectId, required: true },
  isDeleted: { type: Boolean, default: false },
  createdOn: { type: Date, default: Date.now },
});

export const productModel = mongoose.model("products", productSchema);

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