import mongoose from "mongoose";

const orderItemsSchema = new mongoose.Schema(
  {
    quantity: {
        type:Number,
        required:true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"product"
    }
  },
  { timestamps: true }
);

orderItemsSchema.virtual("id").get(function () {
  return this._id.toHexString();
})

orderItemsSchema.set("toJSON", {
  virtuals:true,
});


export default mongoose.model("orderItems",  orderItemsSchema);
