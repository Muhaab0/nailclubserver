import express from "express";
import Category from "../models/Category.js";
const router = express.Router();


router.get("/", async (req,res) => {
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success:false})
    }
    res.status(200).send(categoryList);
})


router.get("/:id", async (req,res)=> {
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(500).json({message:"The category with given ID was not found"})
    }
    res.status(200).send(category);
})


router.post("/", async (req,res,next)=>{
    const category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    try {
        const newCategory = await category.save();
        res.send(newCategory)
    } catch (error) {
        next(error)
    }

})

router.delete("/:id", async (req,res)=>{
    try {
      const category = await Category.findByIdAndRemove(req.params.id)
        if(category) {
            return res.status(200).json({success: true , message:"the category is deleted"})
        } else {
            return res.status(404).json({success:false , message:"category Not Found"})
        }
        
    } catch (err) {
        return res.status(400).json({succes:false, error:err})
}
})


router.put("/:id", async (req,res)=>{
        const updatedcategory = await Category.findByIdAndUpdate(
            req.params.id,
            {
                $set:req.body
            },
            {new:true}
            )
            if (!updatedcategory) 
            return res.status(400).send("the category cannot be created!")

            res.status(200).json(updatedcategory);   
        }
        );



export default router;