import mongoose from "mongoose";

const serviceschema = new mongoose.Schema(
  {
   services:[{
    type: mongoose.Schema.Types.ObjectId,
    required:true,
    ref: "serv",
}] ,
    totalPrice:{
        type:Number,
    }
    
  },
  { timestamps: true }
);

serviceschema.virtual("id").get(function () {
  return this._id.toHexString();
})

serviceschema.set("toJSON", {
  virtuals:true,
});


export default mongoose.model("services",  serviceschema);
