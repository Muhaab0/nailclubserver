import express, { application } from "express";
import Apointments from "../models/Apointments.js";
import Brunches from "../models/Brunches.js";
import Days from "../models/Days.js";
import Times from "../models/Times.js";
import { createError } from "../utils/error.js";
import mongoose from "mongoose"
const router = express.Router();


router.get("/times", async (req,res ,next) => {
    try {
        const times = await Times.find()
        if(!times) {
           return next(createError("no times found"))
        }
        res.status(200).send(times);
    } catch (error) {
     next(error)   
    }
})

router.get("/times/:id", async (req,res ,next) => {
    try {
        const times = await Times.findById(req.params.id)
        if(!times) {
           return next(createError(404,"no times found"))
        }
        res.status(200).send(times);
    } catch (error) {
     next(error)   
    }
})




router.get("/days/:id", async (req,res) => {
    const apointments = await Days.find({brunch:req.params.id}).populate("times", "time")
    if(!apointments) {
        res.status(500).json({success:false})
    }
    res.status(200).send(apointments);
})




router.get("/findDay/:id", async (req,res,next) => {
    const limit = req.query.limit
    
    let d = new Date();
    d.setDate(d.getDate());
    
    
    let ed = new Date();
    ed.setDate(ed.getDate()+1);
    
    try {
    const Dates = await Days.aggregate([

        {$match: {'day': {$gte: d, $lte:ed}}},


        {$match: {'brunch': mongoose.Types.ObjectId(req.params.id)}},

        { $lookup: {
       from: "times",
        localField: "times",
        foreignField: "_id",
        as: "times"
  }}  
    ]).sort("day")
    
    if(!Dates) {
        next(404,"no appointment")
    }
    res.status(200).send(Dates);
        
    } catch (error) {
        next(error)
    }
})

router.get("/findDays/:id", async (req,res,next) => {
    const limit = req.query.limit
    
    let d = new Date();
    d.setDate(d.getDate());
    
    
    // let ed = new Date();
    // ed.setDate(ed.getDate()+7);
    
    // console.log(ed)
    try {
    const Dates = await Days.aggregate([

        {$match: {'day': {$gte: d}}},
        {$sort: {'day':1}},

        {$match: {'brunch': mongoose.Types.ObjectId(req.params.id)}},

//         { $lookup: {
//        from: "times",
//         localField: "times",
//         foreignField: "_id",
//         as: "times"
//   }}  
    ])
    
    if(!Dates) {
        next(404,"no appointment")
    }
    res.status(200).send(Dates);
        
    } catch (error) {
        next(error)
    }
})


router.get("/find7Days/:id", async (req,res,next) => {
    const limit = req.query.limit
    
    let d = new Date();
    d.setDate(d.getDate());
    
    
    let ed = new Date();
    ed.setDate(ed.getDate()+7);
    
    console.log(ed)
    try {
    const Dates = await Days.aggregate([

        {$match: {'day': {$gte: d, $lte:ed}}},


        {$match: {'brunch': mongoose.Types.ObjectId(req.params.id)}},

        { $lookup: {
       from: "times",
        localField: "times",
        foreignField: "_id",
        as: "times"
  }}  
    ]).sort("day")
    
    if(!Dates) {
        next(404,"no appointment")
    }
    res.status(200).send(Dates);
        
    } catch (error) {
        next(error)
    }
})


router.get("/find30Days/:id", async (req,res,next) => {
    const limit = req.query.limit
    
    let d = new Date();
    d.setDate(d.getDate());
    
    
    let ed = new Date();
    ed.setDate(ed.getDate()+30);
    
    console.log(ed)
    try {
    const Dates = await Days.aggregate([

        {$match: {'day': {$gte: d, $lte:ed}}},


        {$match: {'brunch': mongoose.Types.ObjectId(req.params.id)}},

        { $lookup: {
       from: "times",
        localField: "times",
        foreignField: "_id",
        as: "times"
  }}  
    ]).sort("day")
    
    if(!Dates) {
        next(404,"no appointment")
    }
    res.status(200).send(Dates);
        
    } catch (error) {
        next(error)
    }
})






router.get("/getDuplicate", async (req,res,next)=>{
    try {
        
        const Duplicated = await Days.aggregate(
            [
                // {$match: {'brunch': mongoose.Types.ObjectId(req.params.id)}},

                { $unwind : "$day"},
                {"$group" : { "_id": "$day", "count": { "$sum": 1 } } },
                {"$match": {"_id" :{ "$ne" : null } , "count" : {"$gt": 1} } }, 
                // {"$project": {"day" : "$_id", "_id" : 0} },
                {"$sort":{day: 1}}
            ], { allowDiskUse: true }
            )

            res.status(200).send(Duplicated)
            } catch (error) {
            console.log(error)
        }
})





router.post("/add30days/:id", async (req,res,next)=>{
    const params = req.params.id
    console.log(params)
    const now = new Date()
    const startTime = new Date(2017, 3, 22, 11, 0);
    const endTime = new Date(2017, 3, 22, 20, 0, 0);
    const times = [];
    while(startTime <= endTime) {
        startTime.setMinutes(startTime.getMinutes() + 30);
    times.push(startTime.toTimeString().slice(0,5))
    }

    const startDate = new Date();
    let endDate = new Date();
    endDate.setDate(endDate.getDate()+35)
    const date = new Date(startDate);
    const dates = [];
    
    while (date <= endDate) {
        
        dates.push((date.toDateString()));
        date.setDate(date.getDate() + 1);
    }
    let dayResolved = []
    try {
        const saveDate = Promise.all(
            //time
            dates.map(async (day) => {

                      const Duplicated = await Days.findOne({day:day})
                       let dayString = Duplicated?.day.toDateString()

                        console.log(dayString)                     
                            if (day === dayString) {
                                return next()
                            }

                    const saveTimes = Promise.all(
                            times.map(async (t)=>{
                            let newTimes = new Times({
                                time:t
                            })
                            newTimes = await newTimes.save();
                            return newTimes._id;
                        })
                        )
                        const timeResolved = await saveTimes;
                        
                        //day
                        let newDay = new Days({
                            brunch:params ,
                            day:day,
                            times:timeResolved,
                        })

                        newDay = await newDay.save();
                        return newDay;
                    }
                    )
                    )
                    
        res.status(200).send("Done")
    } catch (error) {
        next(error)
    }
})







          






export default router;