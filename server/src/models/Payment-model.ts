import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPayment extends Document {
    user_id: Types.ObjectId;
    amount: number;
    currency: string;
    method: 'paypal' | 'offline'; // Método usado
    status: 'pending' | 'completed' | 'failed' | 'refunded';

    // Datos específicos de PayPal
    paypal_order_id?: string;

    // Datos específicos Offline
    offline_reference?: string; // Nro de confirmación / hash

    // Producto adquirido
    plan: 'student' | 'talent';

    created_at: Date;
}

const payment_schema = new Schema<IPayment>(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'EUR' },
        method: { type: String, enum: ['paypal', 'offline'], required: true },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        paypal_order_id: { type: String },
        offline_reference: { type: String },
        plan: { type: String, enum: ['student', 'talent'], required: true },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const Payment = mongoose.model<IPayment>('Payment', payment_schema);
export default Payment;