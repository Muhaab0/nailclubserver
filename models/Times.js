import mongoose from "mongoose";

const timeSchema = new mongoose.Schema(
    {
        time: {
            type:String,
            required:true,
        }
    },
  { timestamps: true }
);


timeSchema.virtual("id").get(function () {
  return this._id.toHexString();
})

timeSchema.set("toJSON", {
  virtuals:true,
});


export default mongoose.model("time", timeSchema);
