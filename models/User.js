import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    profileImg:{
      type:String,
      default:""
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone:{type:Number, required:true},
    isAdmin:{type:Boolean, default:false},
    tecniqal:{
      type:mongoose.Schema.Types.ObjectId,
      ref: "tecniqal",
    },
    isTecniqal:{Types:Boolean,default:false},    
    isCallCenter:{type:Boolean, default:false},
    city:{type:String},
    avatar: { type: String, default: "" },
    apointments: [{
      type:mongoose.Schema.Types.ObjectId,
      ref:"userApointments"
    }],
    images: [{
      type:mongoose.Schema.Types.ObjectId,
      ref:"userImages"
      }],
    }
  ,
  { timestamps: true }
);




export default mongoose.model("user", userSchema);
