const Product = require('../../models/productModel');
const Stock = require('../../models/stocksModel');
const Sale = require('../../models/salesModel');
const Receipt = require('../../models/receiptsModel');
const statusModel = require('../../utils/statusMessages');

async function getReceiptByDate (data){
    try {
        const { startDate, endDate } = data;
        if(startDate != null && endDate != null){
            const query = {
                isDeleted: false,
                createDate: {
                    $gte: new Date(startDate), 
                    $lte: new Date(endDate),  
                }
            };
            const receipts = await Receipt.find(query);
            return {
                status: statusModel.success.code,
                error: false,
                data: receipts,
                message: statusModel.success.message, 
              };
        }
        else{
            return {
                status: statusModel.notFound.code,
                error: true,
                message: 'Missing start and end-date', 
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

async function getAll (data) {
    try {
        const page = data.page ? parseInt(data.page) : 1;
        const pageSize = data.pageSize ? parseInt(data.pageSize) : 10;
    
        const skip = (page - 1) * pageSize;

        const receipt = await Receipt.find({ isDeleted: false })
            .skip(skip)
            .limit(pageSize);

        return {
            status: statusModel.success.code,
            error: false,
            data: receipt,
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

async function returnByReceiptNumber (data){
    try {
        const receiptNumber = data;
        const receipt = await Receipt.findOne({ receiptNumber: receiptNumber });
        return {
            status: statusModel.success.code,
            error: false,
            data: receipt,
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

async function returnReceipt (data){
    try {
        const receiptNumber = data;
        const receipt = await Receipt.findOne({ receiptNumber: receiptNumber });
        if (receipt && receipt.isActive == true) {
            const selesIds = receipt.selesId;
            const saleIDStrings = selesIds.map(saleData => saleData.sele_id.toString());
            for(let i = 0; i < saleIDStrings.length; i++){
                let salePush = await Sale.findById(saleIDStrings[i]);
                let stockPush = await Stock.findOne({ product_id: salePush.product_id });
                stockPush.stockQuantity += salePush.quantitySold;
                salePush.isDeleted = true;
                salePush.isActive = false;
                salePush.deleteDate = Date.now();
                receipt.isActive = false;
                receipt.isDeleted = true;
                await receipt.save();
                await salePush.save();
                await stockPush.save();
            }
            return {
                status: statusModel.success.code,
                error: false,
                data: receipt,
                message: statusModel.success.message, 
              };
        } else {
            return {
                status: statusModel.internalServerError.code,
                error: true,
                data: null,
                message: "Receipt don't exist",
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

async function createReceipt(salesArray){
    try {
        let multipleSaleIdFlag = false;
        let sellExistFlag = true;
        let notFoundSaleID = null;
        const productIdCount = {};

        for (const saleData of salesArray) {
            const { saleId } = saleData;

            if (productIdCount[saleId]) {
                multipleSaleIdFlag = true;
            }
            productIdCount[saleId] = (productIdCount[saleId] || 0) + 1;
        }
        if(multipleSaleIdFlag){
            return {
                status: statusModel.internalServerError.code,
                error: true,
                data: null,
                message: 'Multiple same sales Id found in same receipt!',
            };
        }
        else{
            for(const saleData of salesArray){
                const { saleId } = saleData;
                const sale = await Sale.findById(saleId);
                if(sale == null){
                    sellExistFlag = false;
                    notFoundSaleID = saleId;
                }
            }

            if(sellExistFlag == true){
                let calCotalAmmount = 0;
                let totalDiscountAmmount = 0;
                let salesId = [];
                for(const saleData of salesArray){
                    const { saleId } = saleData;
                    const salePush = await Sale.findById(saleId);
                    calCotalAmmount += salePush.quantitySold * salePush.salePrice;
                    totalDiscountAmmount += salePush.discount;
                    salesId.push({
                        sele_id: saleId,
                    });

                }
                let tax_amount = (parseInt(calCotalAmmount) * process.env.db_taxPercent);
                let grand_Total = calCotalAmmount + tax_amount - totalDiscountAmmount;
                const receiptData = {
                    receiptNumber: generateReceiptNumber(), 
                    totalAmount: calCotalAmmount,
                    discount: totalDiscountAmmount,
                    taxAmmount: tax_amount,
                    grandTotal: grand_Total,
                    date: new Date(),
                    selesId: salesId
                }
                const receipt = new Receipt(receiptData);
                await receipt.save();
                return {
                    status: statusModel.success.code,
                    error: false,
                    data: receipt,
                    message: statusModel.success.message, 
                  };
            }
            else{
                return {
                    status: statusModel.internalServerError.code,
                    error: true,
                    data: null,
                    message: "Saleid don't exist in database",
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

function generateReceiptNumber() {
    const prefix = "SCPT"; 
    const timestamp = Date.now(); 
    const randomDigits = Math.floor(Math.random() * 10000); 

    return `${prefix}${timestamp}${randomDigits}`;
}

module.exports = {
    getReceiptByDate,
    getAll,
    returnByReceiptNumber,
    returnReceipt,
    createReceipt
    
}