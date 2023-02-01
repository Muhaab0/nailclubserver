import mongoose from "mongoose";

const userImagesSchema = new mongoose.Schema(
  {
    img: [{
        type:String,
        default:"",
          }],
    desc:{
        type:String,
        default:"",
      },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }
     
    }
  ,
  { timestamps: true }
);




export default mongoose.model("userImages", userImagesSchema);
