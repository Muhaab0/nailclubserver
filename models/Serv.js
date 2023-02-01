import mongoose from "mongoose";

const servSchema = new mongoose.Schema(
  {
    serv:{
        type:String
    },
    price:{
        type:Number
    }
  },
  { timestamps: true }
);



export default mongoose.model("serv",  servSchema);
