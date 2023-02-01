import express from "express";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
const router = express.Router();
import mongoose from "mongoose";
import { createError } from "../utils/error.js";
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




router.get("/", async (req,res) => {
    let filter = {}
    if (req.query.category) {
        filter = {category: req.query.category.split(',') }
    }

    const productList = await Product.find(filter)
    //.populate("category");
    if(!productList) {
        res.status(500).json({success:false})
    }
    res.send(productList);
})



router.get("/:id", async (req,res) => {
    const product = await Product.findById(req.params.id).populate("category");

    if(!product) {
        res.status(500).json({success:false})
    }
    res.send(product);
})


router.post("/" , uploadOptions.single("image"), async (req,res) => {
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send("Invalid Category")
    const file = req.file
    if(!file) return res.status(400).send("No file!")


    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`
    try {
        const newProduct = new Product({
            name:req.body.name,
            description: req.body.description,
            image:`${basePath}${fileName}`,
            countInStock:req.body.countInStock,
            category:req.body.category,
            cost:req.body.cost
        })
        const createdProduct = await newProduct.save();
        if (!createdProduct) 
        return res.status(500).send("The product cannot be created")

         res.status(201).json(createdProduct)
        } catch (err) {
        res.status(500).json(err)
    }
})


router.put("/:id", async (req,res)=>{    
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send("Invalid Product Id");
    }
    console.log(req.body.image)
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send("Invalid category")
    
    try {
        const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            $set:req.body
        },
        {new:true}
        )
        res.status(200).json(product);   
    } catch (error) {
        return res.status(400).send("the product cannot be updated!")   
    }
    }
    );

    router.delete("/:id", async (req,res)=>{
        try {
          const product = await Product.findByIdAndRemove(req.params.id)
            if(product) {
                return res.status(200).json({success: true , message:"the product is deleted"})
            } else {
                return res.status(404).json({success:false , message:"product Not Found"})
            }
            
        } catch (err) {
            return res.status(400).json({succes:false, error:err})
    }
    })


    router.get("/get/count", async (req,res,next)=> {
        const productCount = await Product.countDocuments()

        if(!productCount) {
            return next(createError(500,"No Any Product Found"))
        }
        res.send({
            productCount: productCount
        });
    })




    router.get("/get/featured/:count", async (req,res) => {
        const count = req.params.count ? req.params.count : 0
        try {
            const product = await Product.find({isFeatured:true}).limit(+count)
            res.send(product);            
        } catch (err) {
            
            res.status(500).json(err)
        }
    })


    router.put("/gallery-images/:id",uploadOptions.array("images",10), async (req,res,next)=>{    
        if(!mongoose.isValidObjectId(req.params.id)) {
            return next(createError(404,"Cant find product"))
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
                const product = await Product.findByIdAndUpdate(
                req.params.id,
                {
                    images: imagesPaths
                },
                {new:true}
                )
                res.status(200).json(product);   
            }
             catch (error) {
                 return next(error) 
        }
    }
        )
    

export default router;