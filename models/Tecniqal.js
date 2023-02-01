import mongoose from "mongoose";

const TecniqalSchema = new mongoose.Schema(
  {
    prep: {
      type: Number,
      required:true,
      default:0
  },
    finish: {
      type: Number,
      required:true,
      default:0
  },
  name: {
    type:String,
  },
user: {
    type: mongoose.Schema.Types.ObjectId,
    required:true,
    ref: "user",
},
brunch: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "brunch",
},
  },
  { timestamps: true }
);

TecniqalSchema.virtual("id").get(function () {
  return this._id.toHexString();
})

TecniqalSchema.set("toJSON", {
  virtuals:true,
});


export default mongoose.model("tecniqal",  TecniqalSchema);
