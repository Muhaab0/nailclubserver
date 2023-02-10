import mongoose from "mongoose";

const userApointSchema = new mongoose.Schema(
    {
            user: {
                type:mongoose.Schema.Types.ObjectId,
                required:true,
                ref: "user",
            } ,
            phone:{type:Number, required:true},
            day: {
                type:mongoose.Schema.Types.ObjectId,
                required:true,
                ref: "days",
              } ,
              time: {
                type:mongoose.Schema.Types.ObjectId,
                required:true,
                ref: "time",
            } ,
            
            services: [{
              type:mongoose.Schema.Types.ObjectId,
              required:true,
              ref: "serv",
              }] ,
              totalPrice:{
                type:Number,
            },
            brunch: {
              type:mongoose.Schema.Types.ObjectId,
              required:true,
              ref: "brunch",
            }
          
            
    },
  { timestamps: true }
);


userApointSchema.virtual("id").get(function () {
  return this._id.toHexString();
})

userApointSchema.set("toJSON", {
  virtuals:true,
});


export default mongoose.model("userApointments", userApointSchema);
