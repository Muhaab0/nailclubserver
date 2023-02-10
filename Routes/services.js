import User from "../models/User.js";
import  express  from "express";
import Services from "../models/Services.js";
import Serv from "../models/Serv.js";
const router = express.Router();


router.get("/", async (req,res,next)=> {
    try {
        const userList = await Serv.find()
        if(!userList) {
            res.status(500).json({succes:false})
        }
        res.send(userList)
        
    } catch (error) {
        next(error)
    }
})



router.get("/:id", async (req,res,next)=> {
    try {
        const userList = await Serv.findById(req.params.id)
        if(!userList) {
            res.status(500).json({succes:false})
        }
        res.send(userList)
        
    } catch (error) {
        next(error)
    }
})



router.post("/", async (req, res,next) => {
    const services = await Promise.all(
      req.body.services.map(async (service) => {
        let newService = new Serv({
          serv: service.service,
          price: service.price,
        })
        newService = await newService.save()
        return newService; 
    } ) )
    
        const serviceResolved =  services;

        const totalPrices = await Promise.all(serviceResolved.map(async serv => {
            const serviceItem = await Serv.findOne(serv).populate("price")
           const totalPrice = serviceItem.price;
           return totalPrice
        }))
        const totalPrice = totalPrices.reduce((a,b)=> a+b , 0)

        try {
           let services = await Services({
            services: serviceResolved,
            totalPrice: totalPrice
           })
            services = await services.save();
            res.status(200).json(services)
        } catch (err) {
            next(err)
        }
    })

      
    



   



export default router;