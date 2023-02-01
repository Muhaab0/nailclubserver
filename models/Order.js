import mongoose from "mongoose";

const orderchema = new mongoose.Schema(
  {
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "orderItems",
        required:true
    }] ,
        city: {
            type:String,
            required:true ,
        },

        phone: {
            type:String ,
            required:true
        }, 
        status: {
            type:String,
            required:true,
            default:"Pending"
        }, 
        totalPrice: {
            
        },
        user: {
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        }
  },
  { timestamps: true }
);

orderchema.virtual("id").get(function () {
  return this._id.toHexString();
})

orderchema.set("toJSON", {
  virtuals:true,
});


export default mongoose.model("order",  orderchema);
