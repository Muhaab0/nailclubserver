import express from "express";
import Brunches from "../models/Brunches.js";
import Days from "../models/Days.js";
import Times from "../models/Times.js";
import { createError } from "../utils/error.js";
import mongoose, { isObjectIdOrHexString } from "mongoose"
const router = express.Router();





router.get("/days/:id", async (req,res) => {
    const apointments = await Days.find({brunch:req.params.id}).populate("times", "time")
    if(!apointments) {
        res.status(500).json({success:false})
    }
    res.status(200).send(apointments);
})

router.get("/spicDay/:id", async (req,res) => {
    const apointments = await Days.findById(req.params.id).populate("times")
    if(!apointments) {
        res.status(500).json({success:false})
    }
    res.status(200).send(apointments);
})




router.get("/findDay/:id", async (req,res,next) => {
    const limit = req.query.limit
    
    let d = new Date();
    d.setDate(d.getDate()-1);
    
    
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
    d.setDate(d.getDate()-1);
    
    
    // let ed = new Date();
    // ed.setDate(ed.getDate()+7);
    
    // console.log(ed)
    try {
    const Dates = await Days.aggregate([

        {$match: {'day': {$gte: d}}},
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
    console.log(Dates.length)
    } catch (error) {
        next(error)
    }
})


router.get("/find7Days/:id", async (req,res,next) => {
    const limit = req.query.limit
    
    let d = new Date();
    d.setDate(d.getDate()-1);
    
    
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
    console.log(Dates.length)
    } catch (error) {
        next(error)
    }
})


router.get("/find30Days/:id", async (req,res,next) => {
    const limit = req.query.limit
    
    let d = new Date();
    d.setDate(d.getDate()-1);
    
    console.log(d)
    let ed = new Date();
    ed.setDate(ed.getDate()+25);
    
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
                { $unwind : "$brunch"},
                {"$group" : { "_id": "$day", "count": { "$sum": 1 } } },
                {"$match": {"_id" :{ "$ne" : null } , "count" : {"$gt": 1} } }, 
                {"$project": {"day" : "$_id", "_id" : 0} },
                {"$sort":{day: 1}}
            ], { allowDiskUse: true }
            )

            res.status(200).send(Duplicated)
            } catch (error) {
            console.log(error)
        }
})





router.post("/add30days/:id", async (req,res,next)=>{


    function formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
      }
      
      const now = new Date()
    const startTime = new Date(2017, 3, 22, 10, 0);
    const endTime = new Date(2017, 3, 22, 20, 0);
    const times = [];
    while(startTime <= endTime) {
    startTime.setMinutes(startTime.getMinutes() + 30);
    const timeFormated = formatAMPM(startTime)
    times.push(timeFormated)
    }




    const startDate = new Date();
    let endDate = new Date();
    endDate.setDate(endDate.getDate()+29)
    const date = new Date(startDate);
    const dates = [];

    
    while (date <= endDate) {
        
        dates.push((date.toDateString()));
        date.setDate(date.getDate() + 1);
    }
    let dayResolved = []

            const brunch = await Brunches.findById(req.params.id)
            if (!brunch) {
                return next(createError(404,"not found brunch"))
            }

    try {
        const saveDate = Promise.all(
            //time
            dates.map(async (day) => {

                      const duplicated = await Days.find({day:day})
                    const duplicatedBrunch = Promise.all(
                        duplicated.map((duplic) => {
                            let brunched = duplic?.brunch
                            return brunched._id
                        })
                        )
                        const DuplicatedResolv = await duplicatedBrunch;
                        

                        let filter =  DuplicatedResolv.filter((dup)=>{
                           let filtered = dup.toString() === brunch?._id.toString()
                            return filtered
                        })



                        if (filter.length > 0) {
                            // console.log("Duplicated")
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
                            brunch:brunch.id ,
                            date:day.toString(),
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