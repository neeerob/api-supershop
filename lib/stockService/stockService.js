const Product = require('../../models/productModel');
const Stock = require('../../models/stocksModel')
const statusModel = require('../../utils/statusMessages');


async function getAllStocks(data) {
    try {
      const page = data.page ? parseInt(data.page) : 1;
      const pageSize = data.pageSize ? parseInt(data.pageSize) : 10;
  
      const skip = (page - 1) * pageSize;
  
      const stock = await Stock.find({ isDeleted: false })
        .skip(skip)
        .limit(pageSize);

      return {
        status: statusModel.success.code,
        error: false,
        data: stock,
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

async function searchStockByID(data){
    try{
        const product = await Stock.findById(data);
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

async function searchStockByProductID(data){
    try{
        const product = await Stock.findOne({ product_id: data });
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

async function updateStock(productId,stockQuantity){
    try {
        const stockEntry = await Stock.findOne({ product_id: productId });
        if (!stockEntry) {
            return {
                status: statusModel.notFound.code,
                error: true,
                data: null,
                message: statusModel.notFound.message,
              };
        }

        if(stockEntry.stockQuantity + stockQuantity >= 0){
            stockEntry.stockQuantity = parseInt(stockEntry.stockQuantity) + parseInt(stockQuantity);
            await stockEntry.save();
            return {
                status: statusModel.success.code,
                error: false,
                data: stockEntry,
                message: statusModel.success.message, 
            };
        }
        else{
            return {
                status: statusModel.conflict.code,
                error: false,
                data: stockEntry,
                message: 'In sufficient stock', 
            };
        }

    } catch (error) {
        return {
            status: statusModel.internalServerError.code,
            error: true,
            data: error,
            message: statusModel.internalServerError.message,
        };
    }
}

module.exports = {
    getAllStocks,
    searchStockByID,
    searchStockByProductID,
    updateStock
}