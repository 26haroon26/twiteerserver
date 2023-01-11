import express from "express";
import { userModel } from "../database/model.mjs";
import { varifyHash, stringToHash } from "bcrypt-inzi";
const router = express.Router();

router.post("/change_password", async (req, res) => {
  // new tariqa he try catch ka
  try {
    const body = req.body;
    const currentpassword = body.current_password;
    const newpassword = body.new_password;
    const _id = req.body.token._id;
    const user = await userModel.findOne({ _id: _id }, "email password").exec();

    if (!user) {
      // ye new he jo ke error ane ke sorat me age nahi jane dega catch pr bhej de ga
      throw new Error("User not found");
    }
    const isMatched = await varifyHash(currentpassword, user.password);
    if (!isMatched) throw new Error("password is not match");

    const newHash = await stringToHash(newpassword);
    await userModel.updateOne({ _id: _id }, { password: newHash }).exec();

    res.send({
      message: "password changed success",
    });
    return;
  } catch (error) {
    res.status(500).send(error);
  }
});
export default router;
