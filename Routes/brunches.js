import express from "express";
import Brunches from "../models/Brunches.js";
import Category from "../models/Category.js";
import Days from "../models/Days.js";
import Tecniqal from "../models/Tecniqal.js";
import Times from "../models/Times.js";
import User from "../models/User.js";
import { createError } from "../utils/error.js";
const router = express.Router();
import multer from "multer"





const FILE_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpeg",
    "image/jpg": "jpg",

}


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error("invalid image type");

        if(isValid) {
            uploadError = null
        }
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
      const filesName = file.originalname.split(" ").join("-");
      const extension = FILE_TYPE_MAP[file.mimetype]
      cb(null, `${filesName}-${Date.now()}.${extension}`)
    }
  })

const uploadOptions = multer({storage: storage})



router.get("/", async (req,res,next) => {
    try {
        
        const Brunch = await Brunches.find().populate({    
            path:"top", populate:{path: "finish" , select:"finish , user , name"}
             }).populate({
            path: "top",populate:{path: "prep" , select:"prep , user , name"}   
             }).populate({ path : "tecniqal" ,select : "name , prep , finish , user", populate:{path:"user"}})
             
        
        if(!Brunch) {
        return  next(createError(404,"brunch not found"))
        }
        res.status(200).send(Brunch);
    } catch (error) {
        next(error)
    }
})



router.get("/:id", async (req,res,next) => {
    try {
        
        const Brunch = await Brunches.findById(req.params.id).populate({    
        path:"top", populate:{path: "finish" , select:"finish , user , name"}
         }).populate({
        path: "top",populate:{path: "prep" , select:"prep , user , name"}   
         }).populate("tecniqal" , "name prep finish user")
         
        
        if(!Brunch) {
        return  next(createError(404,"brunch not found"))
        }
        res.status(200).send(Brunch);
    } catch (error) {
        next(error)
    }
})



router.post("/", uploadOptions.array("images",10), async (req,res,next)=>{
    const files = req.files
    let  imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    if(files) {
        files.map(file=>{
            imagesPaths.push(`${basePath}${file.filename}`);
        })
    }
    try {
   let newBrunch = new Brunches({
        branchname:req.body.branch,
        location:{city:req.body.city},  
        images:imagesPaths
    })

    await newBrunch.save()
    res.status(200).send(newBrunch)
        
    } catch (error) {
        next(error)
    }
})




router.put("/:id", async (req,res,next)=>{
    let filter = {}
    if (req.query.user) {
        filter = req.query.user.split(',')
    }
    try {

        
        let addUser
        let userValid
        let brunch = await Brunches.findById(req.params.id)
        if(!brunch){return next(createError(404,"brunch is not found"))}
        Promise.all(
            filter.map(async (u)=> {
                
                let tecniqalValid = await Tecniqal.findById(u)    
                let oldBrunch = await Brunches.findOne({tecniqal:tecniqalValid?._id})
                        await  oldBrunch?.updateOne(
                            {
                          $pull: {tecniqal:tecniqalValid?._id}
                        }, {new:true}
                        )  
                        await  brunch?.updateOne(
                            {
                          $addToSet: {tecniqal:tecniqalValid?._id}
                          
                        }, {new:true}
                        )  




                    await tecniqalValid?.updateOne(
                        {
                            $set:{"brunch":req.params?.id}
                            
                        },
                        {new:true}
                        )
                        
                        
                    })
                    )
                    
                    res.status(200).send("thanks")
        
    } catch (error) {
        next(error)
    }
})




router.get("/top/prep/:id", async (req,res,next)=>{
    let top  = await Tecniqal.find({brunch:req.params.id}).sort({prep: -1}).limit(3).populate("user" ,"name")
    console.log(top)
     
    try {
        let newTop = await Brunches.findByIdAndUpdate(
         req.params.id,
         {
         $set:{"top.prep": top},
        
     },{new:true})

    res.status(200).send(newTop)
        
    } catch (error) {
        next(error)
    }
})


router.get("/top/finish/:id", async (req,res,next)=>{
    let top  = await Tecniqal.find({brunch:req.params.id}).sort({finish: -1}).limit(3).populate("user" ,"name")
    console.log(top)
     
    try {
        let newTop = await Brunches.findByIdAndUpdate(
         req.params.id,
         {
         $set:{"top.finish": top},
        
     },{new:true})

    res.status(200).send(newTop)
        
    } catch (error) {
        next(error)
    }
})


router.put("/images/:id",uploadOptions.array("images",10), async (req,res,next)=>{    
    const files = req.files
    let  imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    if(files) {
        files.map(file=>{
            imagesPaths.push(`${basePath}${file.filename}`);
        })
    }
        try {
            const Brunch = await Brunches.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths
            },
            {new:true}
            )
            res.status(200).json(Brunch);   
        }
         catch (error) {
             return next(error) 
    }
}
    )




export default router;