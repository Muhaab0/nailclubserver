import mongoose from "mongoose";

const daySchema = new mongoose.Schema(
    {
      brunch:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "brunch",
    },
        day: {
            type: Date,
            required:true,  
          },
        times:  [{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"times"
          }]
        ,
    },
  { timestamps: true }
);


daySchema.virtual("id").get(function () {
  return this._id.toHexString();
})

daySchema.set("toJSON", {
  virtuals:true,
});


export default mongoose.model("days", daySchema);
