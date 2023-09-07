const mongoose = require("mongoose");
const Product = require('../../models/productModel');
const Stock = require('../../models/stocksModel')
const statusModel = require('../../utils/statusMessages');

/**
 * getAll  - 
 * @param {object}  
 * @returns  {object}
 */

async function getAllProducts(data) {
    try {
      const page = data.page ? parseInt(data.page) : 1;
      const pageSize = data.pageSize ? parseInt(data.pageSize) : 10;
  
      const skip = (page - 1) * pageSize;
  
      const products = await Product.find({ isDeleted: false })
        .skip(skip)
        .limit(pageSize);

      return {
        status: statusModel.success.code,
        error: false,
        data: products,
        message: statusModel.success.message, 
      };
    } catch (error) {
      return {
        status: statusModel.internalServerError.code,
        error: true,
        data: error,
        message: statusModel.internalServerError.message,
      };
    }
}

async function searchProductByID(data){
    try{
        const product = await Product.findById(data);
        if(product){
            return {
                status: statusModel.success.code,
                error: false,
                data: product,
                message: statusModel.success.message, 
            };
        }
        else{
            return {
                status: statusModel.notFound.code,
                error: true,
                data: null,
                message: statusModel.notFound.message, 
            };
        }
    }
    catch(error){
        return {
            status: statusModel.internalServerError.code,
            error: true,
            data: error,
            message: statusModel.internalServerError.message,
          };
    }
}

async function deleteProduct(data){
    try{
        const product = await await Product.findByIdAndUpdate(data, { isDeleted: true, deleteDate: Date.now() }, { new: true });
        if(product){
            return {
                status: statusModel.success.code,
                error: false,
                data: product,
                message: statusModel.success.message, 
            };
        }
        else{
            return {
                status: statusModel.notFound.code,
                error: true,
                data: null,
                message: statusModel.notFound.message, 
            };
        }
    }
    catch(error){
        return {
            status: statusModel.internalServerError.code,
            error: true,
            data: error,
            message: statusModel.internalServerError.message,
        };
    }
}

async function updateProduct(Id, data){
    try{
        let product = await Product.findByIdAndUpdate(
            Id,
            data,
            { $set: { isDeleted: false } },
            { new: true}
        );
        if(product){
            return {
                status: statusModel.success.code,
                error: false,
                data: await Product.findById(Id),
                message: statusModel.success.message, 
            };
        }
        else{
            return {
                status: statusModel.notFound.code,
                error: true,
                data: null,
                message: statusModel.notFound.message
            };
        }
    }
    catch(error){
        return {
            status: statusModel.internalServerError.code,
            error: true,
            data: error,
            message: statusModel.internalServerError.message,
        };
    }
}

async function addProduct(data, quantityParam){
    try{
        let product = await Product.create(data);

        const stockEntry = new Stock({
            product_id: product._id,
            stockQuantity: quantityParam,
        });
        await stockEntry.save();
        if(product &&  stockEntry){
            return {
                status: statusModel.success.code,
                error: false,
                data: product,
                message: statusModel.success.message, 
            };
        }
        else{
            return {
                status: statusModel.notFound.code,
                error: true,
                data: null,
                message: statusModel.notFound.message
            };
        }
    }
    catch(error){
        return {
            status: statusModel.internalServerError.code,
            error: true,
            data: error,
            message: statusModel.internalServerError.message,
        };
    }
}

module.exports = {
    getAllProducts,
    searchProductByID,
    deleteProduct,
    updateProduct,
    addProduct
};