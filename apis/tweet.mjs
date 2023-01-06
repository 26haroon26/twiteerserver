import express from "express";
import mongoose from "mongoose";
import { tweetModel } from "../database/model.mjs";

const router = express.Router();

router.post("/tweet", (req, res) => {
  const body = req.body;

  if (!body.text) {
    res.status(400).send({
      message: "required parameters missing",
    });
    return;
  }

  console.log(body.text);

  tweetModel.create(
    {
      text: body.text,
      owner: new mongoose.Types.ObjectId(body.token._id),
    },
    (err, saved) => {
      if (!err) {
        console.log(saved);

        res.send({
          message: "tweet added successfully",
        });
      } else {
        res.status(500).send({
          message: "server error",
        });
      }
    }
  );
});

router.get("/tweets", (req, res) => {
  const userID = new mongoose.Types.ObjectId(req.body.token._id);
  tweetModel.find(
    { owner: userID, isDeleted: false },
    {},
    {
      sort: { _id: -1 },
      limit: 100,
      skip: 0,
      // population kelye
      populate: {
        path: "owner",
        select: "firstName lastName email",
      },
    },
    (err, data) => {
      if (!err) {
        res.send({
          message: "got all tweets successfully",
          data: data,
        });
      } else {
        res.status(500).send({
          message: "server error",
        });
      }
    }
  );
});

router.get("/tweetFeed", (req, res) => {
  tweetModel.find(
    { isDeleted: false },
    {},
    {
      sort: { _id: -1 },
      limit: 100,
      skip: 0,
          },
    (err, data) => {
      if (!err) {
        res.send({
          message: "got all tweets successfully",
          data: data,
        });
      } else {
        res.status(500).send({
          message: "server error",
        });
      }
    }
  );
});
router.get("/tweet/:text", (req, res) => {
  console.log(req.params.text);
  const querrytext = req.params.text;
  tweetModel.find({ text: { $regex: `${querrytext}` } }, (err, data) => {
    if (!err) {
      if (data) {
        res.send({
          message: `get tweet by success`,
          data: data,
        });
      } else {
        res.status(404).send({
          message: "tweet not found",
        });
      }
    } else {
      res.status(500).send({
        message: "server error",
      });
    }
  });
});
router.delete("/tweet/:id", (req, res) => {
  const id = req.params.id;

  tweetModel.deleteOne(
    {
      _id: id,
      // ye isley lgaya he ke amne he tweet delete
      owner: new mongoose.Types.ObjectId(body.token._id),
    },
    (err, deletedData) => {
      console.log("deleted: ", deletedData);
      if (!err) {
        if (deletedData.deletedCount !== 0) {
          res.send({
            message: "tweet has been deleted successfully",
          });
        } else {
          res.status(404);
          res.send({
            message: "No tweet found with this id: " + id,
          });
        }
      } else {
        res.status(500).send({
          message: "server error",
        });
      }
    }
  );
});
router.put("/tweet/:id", async (req, res) => {
  const body = req.body;
  const id = req.params.id;

  if (!body.text) {
    res.status(400).send(` required parameter missing. example request body:
        {
            "text": "value",
                    }`);
    return;
  }

  try {
    let data = await tweetModel
      .findOneAndUpdate(
        { _id: id, owner: new mongoose.Types.ObjectId(body.token._id) },
        {
          text: body.text,
        },
        { new: true }
      )
      .exec();

    console.log("updated: ", data);

    res.send({
      message: "tweet modified successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
});

export default router;
