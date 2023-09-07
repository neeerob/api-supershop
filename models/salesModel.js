const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', 
        required: true
    },
    quantitySold: {
        type: Number,
        required: true
    },
    salePrice: {
        type: Number,
        required: true
    },
    costPrice: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        default: true 
    },
    isActive: {
        type: Boolean,
        default: true 
    },
    isDeleted: {
        type: Boolean,
        default: false 
    },
    createDate: {
        type: Date,
        default: Date.now
    },
    deleteDate: {
        type: Date,
        default: null 
    }
});

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
