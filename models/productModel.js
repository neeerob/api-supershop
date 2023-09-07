const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
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
        default: null // Marked as null by default, indicating not deleted
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
