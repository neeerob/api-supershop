const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require('../models/productModel');
const Stock = require('../models/stocksModel');
const ProductService = require('../lib/productService/productService')
const errorModel = require('../utils/statusMessages');
router.use(express.json());


async function addProduct (req, res){
    let result = null;
    try {
        const data = req.body;
        const quantityParam = req.params.quantity ? parseInt(req.params.quantity) : 0;
        result = await ProductService.addProduct(data, quantityParam);
        if (!result.error) {
            return res.status(result.status).json({data:result.data, error: result.error, message: result.message});
        }
        else{
            return res.status(result.status).json(result);
        }
    } catch (error) {
        console.log(error)
        let err = errorModel.internalServerError
        result = {error: true , data: null , status: err.code, message: err.message}
        return res.status(result.status).json(result);
    }
}


async function updateProduct (req, res) {
    let result = null;
    try {
        let Id = req.params.id;
        let data = req.body;
        const result = await ProductService.updateProduct(Id, data);
        if (!result.error) {
            return res.status(result.status).json({data:result.data, error: result.error, message: result.message});
        }
        else{
            return res.status(result.status).json({ data: result.data, error: result.error, message: result.message });
        }
    } catch (error) {
        console.log(error)
        let err = errorModel.internalServerError
        result = {error: true , data: null , status: err.code, message: err.message}
        return res.status(result.status).json(result);
    }
}

async function deleteProduct (req, res){
    let result = null;
    try {
        let data = req.params.id;
        const result = await ProductService.deleteProduct(data);
        if (!result.error) {
            return res.status(result.status).json({data:result.data, error: result.error, message: result.message});
        }
        else{
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
      const result = await ProductService.getAllProducts(data);
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

async function searchById (req, res){
    let result = null;
    try {
        let data = req.params.id;
        const result = await ProductService.searchProductByID(data);
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

module.exports = {
    addProduct,
    getAll,
    updateProduct,
    deleteProduct,
    searchById
};
