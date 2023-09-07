const Product = require('../../models/productModel');
const Stock = require('../../models/stocksModel');
const Sale = require('../../models/salesModel');
const statusModel = require('../../utils/statusMessages');




async function registerSales (data, discount) {
    try {
        let productId = data.productId;
        let quantitySold = data.quantitySold;
        let salePrice = data.salePrice;
        if(discount == null){
            discount = 0;
        }
        else{
            discount = parseInt(discount);
        }

        if(discount == null){
            discount = 0;
        }
        else{
            discount = parseInt(discount);
        }
        const product = await Product.findById(productId);
        if (!product && product.isDeleted == false) {
            return {
                status: statusModel.notFound.code,
                error: true,
                data: null,
                message: statusModel.notFound.message, 
            };
        }
        else{
            const stock = await Stock.findOne({ product_id: productId });
            if(quantitySold < stock.stockQuantity){
                stock.stockQuantity -= quantitySold;
                await stock.save();

                //sells
                const sale = new Sale({
                    product_id: productId, 
                    quantitySold: quantitySold,
                    salePrice: salePrice,
                    costPrice: product.price,
                    date: new Date(),
                    discount: discount
                });
                await sale.save();

                return {
                    status: statusModel.success.code,
                    error: false,
                    data: sale,
                    message: statusModel.success.message, 
                  };

            }
            else{
                return {
                    status: statusModel.conflict.code,
                    error: true,
                    data: products,
                    message: statusModel.conflict.message, 
                  };
            }
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

async function monthlyReport(){
    try {
        const monthlySales = await Sale.aggregate([
            {
                $match: { isDeleted: false }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                        product_id: "$product_id",
                    },
                    totalRevenue: { $sum: { $multiply: ["$quantitySold", "$salePrice"] } },
                    totalUnitsSold: { $sum: "$quantitySold" },
                    totalProfit: { $sum: { $multiply: ["$quantitySold", { $subtract: ["$salePrice", "$costPrice"] }] } },
                },
            },
            {
                $group: {
                    _id: {
                        year: "$_id.year",
                        month: "$_id.month",
                    },
                    monthlySales: {
                        $push: {
                            product_id: "$_id.product_id",
                            totalRevenue: "$totalRevenue",
                            totalUnitsSold: "$totalUnitsSold",
                            totalProfit: "$totalProfit",
                        },
                    },
                    totalMonthlyRevenue: { $sum: "$totalRevenue" },
                    totalMonthlyProfit: { $sum: "$totalProfit" },
                },
            },
        ]);
        return {
            status: statusModel.success.code,
            error: false,
            data: monthlySales,
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

async function yearlyReport (req, res){
    try {
        const yearlySales = await Sale.aggregate([
            {
                $match: { isDeleted: false }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                    },
                    totalRevenue: { $sum: { $multiply: ["$quantitySold", "$salePrice"] } },
                    totalUnitsSold: { $sum: "$quantitySold" },
                    totalCostOfGoodsSold: { $sum: { $multiply: ["$quantitySold", "$costPrice"] } },
                },
            },
        ]);

        yearlySales.forEach((year) => {
            year.LossOrProfit = year.totalRevenue - year.totalCostOfGoodsSold;
        });

        return {
            status: statusModel.success.code,
            error: false,
            data: yearlySales,
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

async function reportByDate (data){
    try {
        const { productId, startDate, endDate } = data; 
        if (!productId || !startDate || !endDate) {
            return {
                status: statusModel.conflict.code,
                error: true,
                data: null,
                message: 'Missing paramitters', 
              };
        }
        const product = await Product.findById(productId);
        if (!product) {
            return {
                status: statusModel.notFound.code,
                error: true,
                data: null,
                message: statusModel.notFound.message, 
              };
        }
        const filters = {};
        filters.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        };
        filters.product_id = productId;
        const sales = await Sale.find(filters);
        return {
            status: statusModel.success.code,
            error: false,
            data: sales,
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

module.exports = {
    registerSales,
    monthlyReport,
    yearlyReport,
    reportByDate
}