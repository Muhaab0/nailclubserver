import express from "express";
import Archeve from "../models/Archeve.js";
import Brunches from "../models/Brunches.js";
import Category from "../models/Category.js";
import Tecniqal from "../models/Tecniqal.js";
import User from "../models/User.js";
import UsersApointments from "../models/UsersApointments.js";
import { createError } from "../utils/error.js";
import mongoose from "mongoose";
import Days from "../models/Days.js";
import Times from "../models/Times.js";
const ObjectId = mongoose.Types.ObjectId;

const router = express.Router();

router.get("/brunch/:id", async (req, res, next) => {
  try {
    const Archieve = await Archeve.find({brunch:req.params.id})
    .select("user.email user.phone user.name")
    .select("time.time")
    .select("date.day")
    .select("clientTime")
    .select("brunch")
    .select("createdAt")
    .populate("brunch","branchname")


    if (!Archieve) {
      return res.status(500).json("archeve not found");
    }
    res.status(200).send(Archieve);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const Archieve = await Archeve.findById(req.params.id)
      .select("user.email user.phone user.name")
      .select("time.time")
      .select("date.day")
      .select("clientTime")
      .select("brunch")
      .select("createdAt")
      .populate("brunch","branchname")
      .populate("prep1")
      .populate("prep2")
      .populate("prep3")
      .populate("finish1")
      .populate("finish2")
      .populate("finish3")

    if (!Archieve) {
      return next(createError(404, "archeve not found"));
    }
    res.status(200).send(Archieve);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    let userApointment = await UsersApointments.findById(req.body.apointment);
    if (!userApointment) {
      return next(createError(404, "not found userApointment"));
    }
    let brunch = await Brunches.findById(userApointment.brunch);
    if(!brunch){return next(createError(404,"not found brunch"))}

    let totalPrice = userApointment.totalPrice;
    const arrived = userApointment.updatedAt;
    let archeveUser = await User.findById(userApointment.user);
    let archeveDay = await Days.findById(userApointment.day);
    let archedTime = await Times.findById(userApointment.time);
    let prepArray = [];
    let finishArray = [];
    prepArray.push(req.body.prep1, req.body.prep2,req.body.prep3);
    finishArray.push(req.body.finish1, req.body.finish2,req.body.finish3);

    Promise.all(
        prepArray.map(async (u) => {
        let user = await Tecniqal.findById(u);
        await user?.updateOne(
          {
            $inc: { prep: 1 },
          },
          { new: true }
        );
      }),

        finishArray.map(async (u) => {
        let user = await Tecniqal.findById(u);
        await user?.updateOne(
          {
            $inc: { finish: 1 },
          },
          { new: true }
        );
      })
    );

    let newArcheve = await new Archeve({
      user: archeveUser,
      date: archeveDay,
      time: archedTime,
      prep1: req.body.prep1,
      prep2: req.body.prep2 ||ObjectId(),
      prep3: req.body.prep2 || ObjectId(),
      finish1: req.body.finish1 ||ObjectId(),
      finish2: req.body.finish2 ||ObjectId(),
      finish3: req.body.finish2 ||ObjectId(),
      clintTime: { arrived: arrived },
      brunch: brunch,
      totalPrice: totalPrice,
    });
    await newArcheve.save();
    res.status(200).send(newArcheve);
    // await UsersApointments.findByIdAndRemove(req.body.apointment);
  } catch (error) {
    next(error);
  }
});



router.get("/days/:id", async (req,res,next) => {
  let d = new Date();
  d.setDate(d.getDate());
  
  // console.log(d)
  
  // let ed = new Date();
  // ed.setDate(ed.getDate()+7);
  // console.log(ed)

  const limit = req.query.limit
  try {
  const Dates = await Archeve.aggregate([
    { $lookup: {
   from: "days",
    localField: "day",
    foreignField: "_id",
    as: "day",
  }}  ,


  {$match: {'brunch': mongoose.Types.ObjectId(req.params.id)}},
  {$match: {'date.day': {$lte: d}}},


  ]).sort("day")
  
  if(!Dates) {
      next(404,"no appointment")
  }
  res.status(200).send(Dates);
      
  } catch (error) {
      next(error)
  }
})


export default router;
