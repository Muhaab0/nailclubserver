import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
    {
    branchname: {
        type:String,
    },
    location: {
        city: {
            type:String,
        },
        map: {
            type:String,
        }
    },
    tecniqal: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"tecniqal"
      }],
    top:{
        prep: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "tecniqal",
        }],
        finish: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "tecniqal",
        }]
    },
    images: [{
        type:String,
        default:""
    }]

   } , { timestamps: true }
);


branchSchema.virtual("id").get(function () {
  return this._id.toHexString();
})

branchSchema.set("toJSON", {
  virtuals:true,
});


export default mongoose.model("brunch", branchSchema);
