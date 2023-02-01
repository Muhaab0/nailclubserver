import mongoose from "mongoose";

const apointSchema = new mongoose.Schema(
    {
            days: [{
                type:mongoose.Schema.Types.ObjectId,
                required:true,
                ref: "days",
            }] ,
    },
  { timestamps: true }
);


apointSchema.virtual("id").get(function () {
  return this._id.toHexString();
})

apointSchema.set("toJSON", {
  virtuals:true,
});


export default mongoose.model("apointments", apointSchema);

