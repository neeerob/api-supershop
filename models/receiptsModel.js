const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
    receiptNumber: {
        type: String,
        required: true,
        unique: true // Ensure the receipt number is unique
    },
    totalAmount: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    taxAmmount: {
        type: Number,
        required: true
    },
    grandTotal: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
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
    },
    selesId: [
        {
            sele_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Sale' 
            },
        }
    ]
});

const Receipt = mongoose.model('Receipt', receiptSchema);

module.exports = Receipt;
