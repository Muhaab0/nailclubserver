import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type:String,
      required:true,
    },
    description: {
      type:String,
      required:true,
    },
    richDescription:{
      type:String,
      default:'',
    },
    image:{
      type:String,
      default:'',
    },
    images:[{
      type:String,
    }],
    brand:{
      type:String,
      default:""
    },
    cost:{
      Type:Number,
      default:0
    },
    category:{
      type: mongoose.Schema.Types.ObjectId,
      ref:  "category",
      required:true,
    },
    countInStock: {
        type:Number,
        required:true,
        min:0,
        max:255
    },
    rating:{
      type:Number,
      default:0,
    },
    isFeatured:{
      type:Boolean,
      default:false,
    }
  },
  { timestamps: true }
);

productSchema.virtual("id").get(function () {
  return this._id.toHexString();
})

productSchema.set("toJSON", {
  virtuals:true,
});

export default mongoose.model("product", productSchema);
