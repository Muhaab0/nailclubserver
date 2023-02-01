import mongoose from "mongoose";

const archeveSchema = new mongoose.Schema(
    {
        user: {
            type:Object,
            required:true,
        },

        time:{
            type:Object,
            required:true,
        },

        date:{
            type:Object,
            required:true,
        },

        
        prep1: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"tecniqal"
        },
        prep2: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"tecniqal"
        },
        prep3: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"tecniqal"
        },
        finish1: {
            type: mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"tecniqal"
        },
        finish2: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"tecniqal"
        },
        finish3: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"tecniqal"
        },
    clintTime: {
        arrived: {
            type:Date,
            default: new Date(),
            required:true
        },
        endDate: {
            type:Date,
            default: new Date(),
            required:true
        }
    },
    brunch: {
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref: "brunch",
      } ,
      totalPrice: {
        type:Number,
      }

   } , { timestamps: true }
);


archeveSchema.virtual("id").get(function () {
  return this._id.toHexString();
})

archeveSchema.set("toJSON", {
  virtuals:true,
});


export default mongoose.model("archeve", archeveSchema);
