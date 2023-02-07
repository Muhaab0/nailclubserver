import User from "../models/User.js";
import  express, { query }  from "express";
const router = express.Router();
import bcrypt from "bcryptjs"
import {createError} from "../utils/error.js"
import jwt from "jsonwebtoken";
import Tecniqal from "../models/Tecniqal.js";
import mongoose from 'mongoose'
const ObjectId = mongoose.Types.ObjectId;
import multer from "multer"
import UserImages from "../models/UserImages.js"

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




router.post("/register", async (req,res , next)=>{
    try {
    const user = await User.findOne({email:req.body.email})
    if (user) {
      return next(createError(400,"user already exist"))
    }
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password,10),
        phone:req.body.phone,
        city: req.body.city,
    })
    
        newUser = await newUser.save();
        res.send(newUser)
        
    } catch (err) {
        next(err)
        
    } 

})

router.get("/", async (req,res) => {
    const user = await User.find().select("-password")

    if(!user) {
        res.status(500).json({success:false})
    }
    res.status(200).send(user);
})




router.get("/tecniqal", async (req,res,next) => {
    try {
        
        const userTecniqal = await Tecniqal.find().select("-password").populate("user","email").populate("brunch","branchname");
        
        if(!userTecniqal) {
            res.status(500).json({success:false})
        }
        res.status(200).send(userTecniqal);
    } catch (error) {
        next(error)
    }
})


router.get("/tecniqal/:id", async (req,res) => {
    try {
        
        const userTecniqal = await Tecniqal.findById(req.params.id).select("-password").populate("user","email").populate("brunch","branchname");
        
        if(!userTecniqal) {
          return  res.status(500).json({success:false})
        }
        res.status(200).send(userTecniqal);
    } catch (error) {
        next(error)
    }
})



router.get("/userTecniqals", async (req,res) => {
    const user = await User.find({isTecniqal:true}).select("-password").populate("tecniqal");

    if(!user) {
        res.status(500).json({success:false})
    }
    res.status(200).send(user);
})


router.get("/tecniqalByBrunch/:id", async (req,res,next) => {
    try {
        
        const user = await Tecniqal.find({brunch:req.params.id}).populate("user", "email name").populate("brunch","branchname")
        
        if(!user) {
            res.status(500).json({success:false})
        }
        res.status(200).send(user);
    } catch (error) {
        next(error)   
    }
})




router.get("/:id", async (req,res,next)=> {
    try {
        const user = await User.findById(req.params.id).select("-password").populate("tecniqal").populate("images")
        .populate({
            path: "apointments",select:"time", populate: {path: "time", select:"time"}
        }) .populate({
            path: "apointments",select:"day", populate: {path: "day", select:"day"}
        })


        
    
        if (!user) {
        return  next(createError(500,"The user with given ID was not found"))
        }  
        res.status(200).send(user);
        
    } catch (error) {
        next(error)
    }
})

router.post("/login", async (req,res,next)=> {
    const secret = process.env.secret;
    try {
        const user = await User.findOne({email:req.body.email})
        if (!user) {
            return next(createError(404,"user not found"))
        }
        if (user && bcrypt.compareSync(req.body.password, user.password)) {
            const token  = jwt.sign(
                {
                    userId: user.id,
                    isAdmin: user.isAdmin,
                    isTecniqal: user.isTecniqal,
                    isCallCenter: user.isCallCenter,
                    emails:user.email,
                    phone:user.phone

                },
                secret,
            )
            res.status(200).send({user: user.email , token : token});
        } else {
            next(createError(400,"password is wrong"))
        }
    } catch (err) {
        next(err)
    }

    
})

router.get("/get/count", async (req,res,next)=> {
    const userCount = await User.countDocuments()

    if(!userCount) {
        return next(createError(500,"No Any Product Found"))
    }
    res.send({
        userCount: userCount
    });
})


router.delete("/:id", async (req,res)=>{
    try {
      const user = await User.findByIdAndRemove(req.params.id)
        if(user) {
            return res.status(200).json({success: true , message:"the user is deleted"})
        } else {
            return res.status(404).json({success:false , message:"user Not Found"})
        }
        
    } catch (err) {
        return res.status(400).json({succes:false, error:err})
}
})


router.put("/:id", async (req,res,next)=>{
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set:req.body
            },
            {new:true}
            )
            if (!updatedUser) {
                return next(createError(404," the User was not found"))
            }
            res.status(200).json(updatedUser);   
        } catch (err) {
            next(err)
        }
        }
        );




    router.post("/tecniqal/:id", async (req,res , next)=>{
        try {
            const user = await User.findById(req.params.id)
            const name = user.name
            let brunch = req.query.brunch
            let newTecniqal = await new Tecniqal({
                user:req.params.id,
                name:name,
                prep:0,
                finish:0,
                brunch:brunch
                })
                newTecniqal = await newTecniqal.save()
                const updatedUser = await user.updateOne(
                    {
                        tecniqal:newTecniqal._id,
                        isTecniqal:true,
                        
                    }
                    )
                    


                res.status(200).send(newTecniqal)
                    
                } catch (error) {
            next(error)
                }
        })


        
    router.get("/tecniqal/:id", async (req,res,next)=>{
        try {
            let user = await Tecniqal.find({user:req.params.id})
            

    
            if (!user) {
                return  next(createError(500,"The user with given ID was not found"))
                } 

            res.status(200).send(user)
            
            } catch  (err) {
                next(err)
         }})

        //  router.put("/img/:id" ,  uploadOptions.single("image"), async (req,res))

         router.put("/images/:id",uploadOptions.array("img",5), async (req,res,next)=>{    
            if(!mongoose.isValidObjectId(req.params.id)) {
                return next(createError(404,"Cant find user"))
            }   
            const files = req.files
            let  imagesPaths = [];
            const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
            if(files) {
                files.map(file=>{
                    imagesPaths.push(`${basePath}${file.filename}`);
                })
            }
                try {

                    const userImages = new UserImages({
                        "img": imagesPaths,
                        "desc":req.body.desc,
                        "user":req.params.id
                    })
                    await userImages.save();

                    const user = await User.findByIdAndUpdate(
                    req.params.id,
                    {
                      $addToSet: {"images":userImages}
                        
                    },
                    {new:true}
                    )
                    res.status(200).json(user);   
                }
                 catch (error) {
                     return next(error) 
            }
        }
            )
       
router.put("/profileImg/:id" , uploadOptions.single("image"), async (req,res) => {
    const file = req.file
    if(!file) return res.status(400).send("No file!")


    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`
                try {

                    const user = await User.findByIdAndUpdate(
                    req.params.id,
                    {
                    "profileImg":`${basePath}${fileName}`
                        
                    },
                    {new:true}
                    )
                    res.status(200).json(user);   
                }
                 catch (error) {
                     return next(error) 
            }
        }
            )
        
    





export default router;