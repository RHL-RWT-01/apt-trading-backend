import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    customer_name: { type: String, required: true },
    product_name: { type: String, required: true },
    status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
    updated_at: { type: Date, default: Date.now }
}, { timestamps: true });

orderSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;