const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/productModel");
const Sale = require("../models/salesModel");
const Stock = require("../models/stocksModel");
const Receipt = require("../models/receiptsModel");
const SalesService = require("../lib/salesService/salesService");
const errorModel = require("../utils/statusMessages");

router.use(express.json());

// router.post("/registerSales/:discount?", async (req, res) => {
//     try {
//         const salesArray = req.body;

//         const registrationResults = [];
//         let hasInsufficientStock = false;
//         let currentStockInPID = null;
//         let insufficientStockPID = null;
//         let multipleProductIdFlag = false;
//         let productIdExistCheckFlag = true;
//         let notFoundProductId = null;
//         let discount = req.params.discount;
//         if(discount == null){
//             discount = 0;
//         }
//         else{
//             discount = parseInt(discount);
//         }

//         const productIdCount = {};

//         for (const saleData of salesArray) {
//             const { productId, quantitySold, salePrice } = saleData;

//             if (productIdCount[productId]) {
//                 multipleProductIdFlag = true;
//             }
//             productIdCount[productId] = (productIdCount[productId] || 0) + 1;
//         }

//         if (multipleProductIdFlag) {
//             res.status(500).json({ message: "Multiple Product Id found with the same Sale!" });
//         } else {
//             for (const saleData of salesArray) {
//                 const { productId, quantitySold, salePrice } = saleData;
//                 // console.log(saleData);
//                 const product = await Product.findById(productId);
//                 if (!product) {
//                     productIdExistCheckFlag = false;
//                     notFoundProductId = productId;
//                 }
//             }

//             if (!productIdExistCheckFlag) {
//                 res.status(500).json({ message: "Can't find product Id in database. Missing Id: " + notFoundProductId });
//             } else {
//                 for(const saleData of salesArray){
//                     const { productId, quantitySold, salePrice } = saleData;
//                     const stock = await Stock.findOne({ product_id: productId });
//                     if(quantitySold < stock.stockQuantity){
//                         continue;
//                     }
//                     else{
//                         hasInsufficientStock = true;
//                         insufficientStockPID = productId;
//                         currentStockInPID = stock.stockQuantity;
//                         break;
//                     }
//                 }

//                 if(hasInsufficientStock){
//                     res.status(500).json({ message: "Insufficient stock in Product Id: " + insufficientStockPID + " current Stock: " + currentStockInPID});
//                 }
//                 else{
//                     let receiptItems = [];
//                     let reciptTotal = [];
//                     for(const saleData of salesArray){
//                         const { productId, quantitySold, salePrice } = saleData;
//                         const productPush = await Product.findById(productId);

//                         //Change stock quantity
//                         const stockPush = await Stock.findOne({ product_id: productId});
//                         stockPush.stockQuantity -= quantitySold;
//                         await stockPush.save();

//                         //sale initialization
//                         const sale = new Sale({
//                             product_id: productId,
//                             quantitySold: quantitySold,
//                             salePrice: salePrice,
//                             costPrice: productPush.price,
//                             date: new Date(),
//                         });
//                         await sale.save();

//                         //For view
//                         reciptTotal.push({
//                             productId,
//                             quantitySold,
//                             salePrice,
//                             costPrice: productPush.price,
//                           })

//                         //for receipt
//                         receiptItems.push({
//                             product_id: productId,
//                             quantity: quantitySold,
//                             salePrice: salePrice,
//                         });

//                     }

//                     // Create a new receipt
//                     const totalAmountCalculation = calculateTotalAmount(receiptItems);
//                     const receiptData = {
//                     receiptNumber: generateReceiptNumber(),
//                     totalAmount: totalAmountCalculation,
//                     discount: discount,
//                     taxAmmount: totalAmountCalculation * 0.08,
//                     grandTotal: (totalAmountCalculation + (totalAmountCalculation * 0.08)) - discount,
//                     date: new Date(),
//                     soldProducts: receiptItems,
//                     };

//                     const receipt = new Receipt(receiptData);
//                     await receipt.save();

//                     res.status(200).json({ receipt });
//                 }
//             }
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: error.message || "Error registering the sales." });
//     }
// });

//something wrong with sales

async function registerSales(req, res) {
  let result = null;
  try {
    let data = req.body;
    let discount = req.params.discount;
    const result = await SalesService.registerSales(data, discount);
    if (!result.error) {
      return res.status(result.status).json({
        data: result.data,
        error: result.error,
        message: result.message,
      });
    } else {
      return res.status(result.status).json({
        data: result.data,
        error: result.error,
        message: result.message,
      });
    }
  } catch (error) {
    console.log(error);
    let err = errorModel.internalServerError;
    result = {
      error: true,
      data: null,
      status: err.code,
      message: err.message,
    };
    return res.status(result.status).json(result);
  }
}

async function searchById(req, res) {
  let result = null;
  try {
    let data = req.params.id;
    const result = await SalesService.searchByID(data);
    console.log(result);
    if (!result.error) {
      return res.status(result.status).json({
        data: result.data,
        error: result.error,
        message: result.message,
      });
    } else {
      return res.status(result.status).json({
        data: result.data,
        error: result.error,
        message: result.message,
      });
    }
  } catch (error) {
    console.log(error);
    let err = errorModel.internalServerError;
    result = {
      error: true,
      data: null,
      status: err.code,
      message: err.message,
    };
    return res.status(result.status).json(result);
  }
}

async function deleteSale(req, res) {
  let result = null;
  try {
    let data = req.params.id;
    const result = await SalesService.deleteSale(data);
    console.log(result);
    if (!result.error) {
      return res.status(result.status).json({
        data: result.data,
        error: result.error,
        message: result.message,
      });
    } else {
      return res.status(result.status).json({
        data: result.data,
        error: result.error,
        message: result.message,
      });
    }
  } catch (error) {
    console.log(error);
    let err = errorModel.internalServerError;
    result = {
      error: true,
      data: null,
      status: err.code,
      message: err.message,
    };
    return res.status(result.status).json(result);
  }
}

function generateReceiptNumber() {
  const prefix = "SCPT";
  const timestamp = Date.now();
  const randomDigits = Math.floor(Math.random() * 10000);

  return `${prefix}${timestamp}${randomDigits}`;
}

function calculateTotalAmount(receiptItems) {
  let totalAmount = 0;

  for (const item of receiptItems) {
    const { quantity, salePrice } = item;
    totalAmount += quantity * salePrice;
  }

  return totalAmount;
}

async function monthlyReport(req, res) {
  let result = null;
  try {
    const result = await SalesService.monthlyReport();
    if (!result.error) {
      return res.status(result.status).json({
        data: result.data,
        error: result.error,
        message: result.message,
      });
    } else {
      return res.status(result.status).json({
        data: result.data,
        error: result.error,
        message: result.message,
      });
    }
  } catch (error) {
    console.log(error);
    let err = errorModel.internalServerError;
    result = {
      error: true,
      data: null,
      status: err.code,
      message: err.message,
    };
    return res.status(result.status).json(result);
  }
}

// async function dailySalesReport(req, res) {
//   let result = null;
//   try {
//     const data = req.body;
//     console.log("high");
//     console.log(req);
//     const result = await SalesService.dailyReport(data.createDate);
//     if (!result.error) {
//       return res.status(result.status).json({
//         data: result.data,
//         error: result.error,
//         message: result.message,
//       });
//     } else {
//       return res.status(result.status).json({
//         data: result.data,
//         error: result.error,
//         message: result.message,
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     let err = errorModel.internalServerError;
//     result = {
//       error: true,
//       data: null,
//       status: err.code,
//       message: err.message,
//     };
//     return res.status(result.status).json(result);
//   }
// }

async function dailySalesReport(req, res) {
  let result = null;
  try {
    const data = req.body;
    // console.log(req);
    // console.log(data.createDate);
    // const result = await SalesService.dailyReport(data.createDate);
    const result = await SalesService.pathDecider(data.createDate);

    if (!result.error) {
      return res.status(result.status).json({
        data: result.data,
        error: result.error,
        message: result.message,
      });
    } else {
      return res.status(result.status).json({
        data: result.data,
        error: result.error,
        message: result.message,
      });
    }
  } catch (error) {
    console.log(error);
    let err = errorModel.internalServerError;
    result = {
      error: true,
      data: null,
      status: err.code,
      message: err.message,
    };
    return res.status(result.status).json(result);
  }
}

async function yearlyReport(req, res) {
  let result = null;
  try {
    const result = await SalesService.yearlyReport();
    if (!result.error) {
      return res.status(result.status).json({
        data: result.data,
        error: result.error,
        message: result.message,
      });
    } else {
      return res.status(result.status).json({
        data: result.data,
        error: result.error,
        message: result.message,
      });
    }
  } catch (error) {
    console.log(error);
    let err = errorModel.internalServerError;
    result = {
      error: true,
      data: null,
      status: err.code,
      message: err.message,
    };
    return res.status(result.status).json(result);
  }
}

async function reportByDate(req, res) {
  let result = null;
  try {
    const data = req.body;
    const result = await SalesService.reportByDate(data);
    if (!result.error) {
      return res.status(result.status).json({
        data: result.data,
        error: result.error,
        message: result.message,
      });
    } else {
      return res.status(result.status).json({
        data: result.data,
        error: result.error,
        message: result.message,
      });
    }
  } catch (error) {
    console.log(error);
    let err = errorModel.internalServerError;
    result = {
      error: true,
      data: null,
      status: err.code,
      message: err.message,
    };
    return res.status(result.status).json(result);
  }
}

module.exports = {
  registerSales,
  monthlyReport,
  yearlyReport,
  reportByDate,
  searchById,
  deleteSale,
  dailySalesReport,
};
