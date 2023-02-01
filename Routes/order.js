import express from "express";

const router = express.Router();
import { createError } from "../utils/error.js";
import Orderitem from "../models/OrderItem.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";

router.get("/", async (req, res) => {
  const OrderList = await Order.find()
    .populate("user", "name")
    .sort({ createdAt: -1 });
  if (!OrderList) {
    res.status(500).json({ success: false });
  }
  res.send(OrderList);
});

router.get("/:id", async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      });
    if (!order) {
      return next(createError(500, "No Valid Order With This id"));
    }
    res.send(order);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res) => {
  const orderItemIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new Orderitem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );

  const orderItemsIdsResolved = await orderItemIds;
const totalPrices = await Promise.all(orderItemsIdsResolved.map(async orderItemId => {
    const orderItem = await OrderItem.findById(orderItemId).populate("product", "cost")
   const totalPrice = orderItem.product.cost * orderItem.quantity;
   return totalPrice
}))

const totalPrice = totalPrices.reduce((a,b)=> a+b , 0)

let order = new Order({
    orderItems: orderItemsIdsResolved,
    city: req.body.city,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });
  order = await order.save();
  if (!order) return res.status(400).send("the order cannot be created");

  res.send(order);
});



router.put("/:id", async (req,res,next)=>{
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            {
                $set:req.body
            },
            {new:true}
            )
            if (!updatedOrder) {
                return next(createError(404," the Order was not found"))
            }
            res.status(200).json(updatedOrder);   
        } catch (err) {
            next(err)
        }
        }
        );
        

        router.delete("/:id",(req,res,next)=>{
            try {
              Order.findByIdAndRemove(req.params.id).then( order => {
                if (order) {
                         order.orderItems.map(orderItem => {
                         OrderItem.findByIdAndRemove(orderItem)
                    })
                } else {
                    
                    return next(createError(404,"the 0rder was not found"))  
                }
              })
              return res.status(200).json("the Order is deleted")
                } 
                catch (err) {
                    next(err)
                
            }}
        )
        



        router.get("/get/totalsales",async (req,res,next)=>{
            const totalSales = await Order.aggregate([
                {$group: {_id:null , totalsales: {$sum : "$totalPrice"}}}
            ])

            if(!totalSales) {
                return next(createError(400, "The order sales cannot be generated"))
            }
            res.send({totalSales:totalSales.pop().totalsales})
        })




        router.get("/get/count", async (req,res,next)=> {
            const orderCount = await Order.countDocuments()
    
            if(!orderCount) {
                return next(createError(500,"No Any orderCount Found"))
            }
            res.send({
                orderCount: orderCount
            });
        })
    
    

export default router;
