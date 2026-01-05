import mongoose, { Schema, Document, Types } from 'mongoose';

// ============================================
// 📦 TIPOS
// ============================================
export type PlanKey = 'student_quarterly' | 'student_yearly' | 'talent_quarterly' | 'talent_yearly';
export type BasePlan = 'student' | 'talent';
export type Period = 'quarterly' | 'yearly';

export interface IPayment extends Document {
    user_id: Types.ObjectId;
    amount: number;
    currency: string;
    method: 'paypal' | 'offline';
    status: 'pending' | 'completed' | 'failed' | 'refunded';

    // Datos específicos de PayPal
    paypal_order_id?: string;

    // Datos específicos Offline
    offline_reference?: string;

    // Producto adquirido
    plan: PlanKey;           // Plan completo: 'student_quarterly', 'talent_yearly', etc.
    base_plan: BasePlan;     // Plan base: 'student' o 'talent'
    period: Period;          // Período: 'quarterly' o 'yearly'

    created_at: Date;
    updated_at: Date;
}

// ============================================
// 📋 SCHEMA
// ============================================
const payment_schema = new Schema<IPayment>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: 'USD'  // Cambiado de EUR a USD
        },
        method: {
            type: String,
            enum: ['paypal', 'offline'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        paypal_order_id: {
            type: String
        },
        offline_reference: {
            type: String
        },
        plan: {
            type: String,
            enum: ['student_quarterly', 'student_yearly', 'talent_quarterly', 'talent_yearly'],
            required: true
        },
        base_plan: {
            type: String,
            enum: ['student', 'talent'],
            required: true
        },
        period: {
            type: String,
            enum: ['quarterly', 'yearly'],
            required: true
        }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

// ============================================
// 📇 ÍNDICES
// ============================================
// Buscar pagos por usuario
payment_schema.index({ user_id: 1, status: 1 });

// Buscar por referencia offline (para evitar duplicados)
payment_schema.index({ offline_reference: 1 }, { sparse: true });

// Buscar por orden de PayPal
payment_schema.index({ paypal_order_id: 1 }, { sparse: true });

const Payment = mongoose.model<IPayment>('Payment', payment_schema);
export default Payment;