import User from "../models/User.js";
import express from "express";
const router = express.Router();
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";
import UsersApointments from "../models/UsersApointments.js";
import Days from "../models/Days.js";
import Times from "../models/Times.js";
import Serv from "../models/Serv.js";
import Brunches from "../models/Brunches.js";
import mongoose from "mongoose"




router.post("/", async (req, res, next) => {
  try {
    const user = await User.findById(req.body.user);
    if (!user) return next(createError(400, "Invalid user"));

    let day = await Days.findById(req.body.day);
    if (!day) return next(createError(400, "Invalid day"));

    const services = await Promise.all(
      req.body.services.map(async (servic) => {
        let newService = await Serv.findById(servic);
        return newService?._id;
      })
    );

    const serviceRevoked = await services;

    serviceRevoked.map((s) => {
      if (s == null) {
        serviceRevoked.length = 0;
      }
    });

    if (serviceRevoked.length == 0) {
      return next(createError(400, "invalid service"));
    }

    const totalPrices = await Promise.all(
      serviceRevoked.map(async (serv) => {
        const serviceItem = await Serv.findById(serv).populate("price");
        const totalPrice = serviceItem?.price;
        return totalPrice;
      })
    );
    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    const time = await Days.findById(req.body.day);
    const timeFilter = Promise.all(
      time.times.filter((t) => {
        return t == req.body.time;
      })
    );

    let timeRevoked = await timeFilter;

    if (timeRevoked == "") {
      return next(createError(400, "invalid time"));
    }

    const date = await Days.findById(req.body.day);
    const brunch = await Brunches.findById(req.body.brunch);
    if (!brunch) {
      return next(createError(400, "invalid brunch"));
    }
    if (date.brunch != brunch.id) {
      return next(createError(400, "invalid brunch Date"));
    }

    let newApoint = new UsersApointments({
      user: req.body.user,
      day: req.body.day,
      time: req.body.time,
      services: serviceRevoked,
      totalPrice: totalPrice || 0,
      brunch: req.body.brunch,
    });

    if (!newApoint) {
      return next("The appointment cannot be created");
    }
    await Days.updateMany(
        { },
        { $pull: { times: { $in: [ req.body.time ] }} }
    )
    newApoint = await newApoint.save();
    await user.updateOne({
      $addToSet: { apointments: newApoint._id },
    });
    res.status(200).send(newApoint);
  } catch (err) {
    next(err);
  }
});


router.get("/findByBrunch/:id", async (req,res,next) => {
  let d = new Date();
  d.setDate(d.getDate());
  try {
  const Dates = await UsersApointments.find({brunch:req.params.id}).populate("day")


if(!Dates) {
  next(404,"no appointment")
}
res.status(200).send(Dates);
  
} catch (error) {
  next(error)
}
})

router.get("/day/:id", async (req,res,next) => {
  let d = new Date();
  d.setDate(d.getDate());
  
  // console.log(d)
  
  let ed = new Date();
  ed.setDate(ed.getDate()+1);

  const limit = req.query.limit
  try {
  const Dates = await UsersApointments.aggregate([
    { $lookup: {
   from: "days",
    localField: "day",
    foreignField: "_id",
    as: "day",
  }}  ,


  {$match: {'brunch': mongoose.Types.ObjectId(req.params.id)}},
  {$match: {'day.day': {$gte: d, $lte:ed}}},


  ]).sort("day")
  
  if(!Dates) {
      next(404,"no appointment")
  }
  res.status(200).send(Dates);
      
  } catch (error) {
      next(error)
  }
})


router.get("/days/:id", async (req,res,next) => {
  let d = new Date();
  d.setDate(d.getDate());
  
  // console.log(d)
  
  // let ed = new Date();
  // ed.setDate(ed.getDate()+7);
  // console.log(ed)

  const limit = req.query.limit
  try {
  const Dates = await UsersApointments.aggregate([
    { $lookup: {
   from: "days",
    localField: "day",
    foreignField: "_id",
    as: "day",
  }}  ,


  {$match: {'brunch': mongoose.Types.ObjectId(req.params.id)}},
  {$match: {'day.day': {$gte: d}}},


  ]).sort("day")
  
  if(!Dates) {
      next(404,"no appointment")
  }
  res.status(200).send(Dates);
      
  } catch (error) {
      next(error)
  }
})

router.get("/7days/:id", async (req,res,next) => {
  let d = new Date();
  d.setDate(d.getDate());
  
  console.log(d)
  
  let ed = new Date();
  ed.setDate(ed.getDate()+7);
  console.log(ed)

  const limit = req.query.limit
  try {
  const Dates = await UsersApointments.aggregate([
    { $lookup: {
   from: "days",
    localField: "day",
    foreignField: "_id",
    as: "day",
  }}  ,


  {$match: {'brunch': mongoose.Types.ObjectId(req.params.id)}},
  {$match: {'day.day': {$gte: d, $lte:ed}}},


  ]).sort("day")
  
  if(!Dates) {
      next(404,"no appointment")
  }
  res.status(200).send(Dates);
      
  } catch (error) {
      next(error)
  }
})




router.get("/30days/:id", async (req,res,next) => {
  let d = new Date();
  d.setDate(d.getDate());
  
  console.log(d)
  
  let ed = new Date();
  ed.setDate(ed.getDate()+30);
  console.log(ed)

  const limit = req.query.limit
  try {
  const Dates = await UsersApointments.aggregate([
    { $lookup: {
   from: "days",
    localField: "day",
    foreignField: "_id",
    as: "day"
  }}  ,

  {$match: {'brunch': mongoose.Types.ObjectId(req.params.id)}},
  {$match: {'day.day': {$gte: d, $lte:ed}}},


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
