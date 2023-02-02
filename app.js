import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
dotenv.config();
import ProductRouter from "./Routes/product.js"
import CategoryRouter from "./Routes/categories.js"
import userRouter from "./Routes/user.js"
import orderRouter from "./Routes/order.js"
import servicesRouter from "./Routes/services.js"
import brunchesRouter from "./Routes/brunches.js"
import archeveRouter from "./Routes/archeve.js"
import {expressjwt} from "express-jwt"
import { createError } from "./utils/error.js";
import usersApointmentsRouter from "./Routes/userApointments.js";
import appointmentsRouter from "./Routes/appointments.js";


const secret = process.env.secret;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(cors());
app.options("#",cors())


//middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use("/public/uploads",express.static(__dirname+"/public/uploads"))
// userVerify
// app.use(expressjwt({
//   secret,
//   algorithms: ["HS256"],
//   isRevoked: isRevoked
// }).unless({
//   path: [
//     {url: /\/public\/uploads(.*)/ , methods: ["GET", "OPTIONS"]},
//     {url: /\/api\/product(.*)/ , methods: ["GET", "OPTIONS"]},
//     {url: /\/api\/category(.*)/ , methods: ["GET", "OPTIONS"]},
//     {url: /\/api\/brunch(.*)/ , methods: ["GET", "OPTIONS"]},
//     "/api/user/login",
//     "/api/user/register",
//   ]
// })
// )
 async function isRevoked(req,token,done) {
  if (token.payload.isAdmin === false) {
    return true
  }
  return false
}
//routers
app.use("/api/product", ProductRouter  )
app.use("/api/category", CategoryRouter  )
app.use("/api/user", userRouter  )
app.use("/api/order", orderRouter  )
app.use("/api/apointments", appointmentsRouter  )
app.use("/api/userApointments", usersApointmentsRouter  )
app.use("/api/services", servicesRouter  )
app.use("/api/brunch", brunchesRouter  )
app.use("/api/archeve", archeveRouter  )

app.use((err, req, res, next) => {
    const errorStatus = err.status || 500;
    const errorMessage = err.message || "Something went wrong!";
    return res.status(errorStatus).json({
      success: false,
      status: errorStatus,
      message: errorMessage,
    });
  });



// Connecting
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI,() => console.log("DB Connected"))
.catch(e=>console.log(e));

// const port = process.env.PORT;
// app.listen(port, () => {
//   console.log(`App is running on port ${port}`);
// });


var server = app.listen(process.env.PORT || 3000, function () {
  var port = server.address().port;
  console.log("Express is working on port" + port)
})