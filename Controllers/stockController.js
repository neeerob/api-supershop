const express = require("express");
const router = express.Router();
const Stock = require('../models/stocksModel');
const stockServicce = require('../lib/stockService/stockService')
const errorModel = require('../utils/statusMessages');
router.use(express.json());

async function updateStock (req, res) {
  let result = null;
    try {
        const stockQuantity  = req.params.quantity;
        const productId = req.params.product_id;
        const result = await stockServicce.updateStock(productId, stockQuantity);
        if (!result.error) {
            return res.status(result.status).json({data:result.data, error: result.error, message: result.message});
          } else {
            return res.status(result.status).json({ data: result.data, error: result.error, message: result.message });
          }
    } catch (error) {
      console.log(error)
      let err = errorModel.internalServerError
      result = {error: true , data: null , status: err.code, message: err.message}
      return res.status(result.status).json(result);
    }
}

async function searchById (req, res){
  let result = null;
    try {
        let data = req.params.id;
        const result = await stockServicce.searchStockByID(data);
        console.log(result);
        if (!result.error) {
            return res.status(result.status).json({data:result.data, error: result.error, message: result.message});
          } else {
            return res.status(result.status).json({ data: result.data, error: result.error, message: result.message });
          }
    } catch (error) {
      console.log(error)
      let err = errorModel.internalServerError
      result = {error: true , data: null , status: err.code, message: err.message}
      return res.status(result.status).json(result);
    }
}

async function searchByProductId (req, res){
  let result = null;
    try {
        let data = req.params.id;
        const result = await stockServicce.searchStockByProductID(data);
        console.log(result);
        if (!result.error) {
             return res.status(result.status).json({data:result.data, error: result.error, message: result.message});
          } else {
            return res.status(result.status).json({ data: result.data, error: result.error, message: result.message });
          }
    } catch (error) {
      console.log(error)
      let err = errorModel.internalServerError
      result = {error: true , data: null , status: err.code, message: err.message}
      return res.status(result.status).json(result);
    }
}

async function getAll(req, res) {
  let result = null;
    try {
    let data = req.query;
      const result = await stockServicce.getAllStocks(data);
      if (!result.error) {
        return res.status(result.status).json({data:result.data, error: result.error, message: result.message});
      } else {
        return res.status(result.status).json({data: result.data, error: result.error, message: result.message });
      }
    } catch (error) {
      console.log(error)
        let err = errorModel.internalServerError
        result = {error: true , data: null , status: err.code, message: err.message}
        return res.status(result.status).json(result);
    }
}

module.exports = {
    updateStock,
    getAll,
    searchById,
    searchByProductId
}