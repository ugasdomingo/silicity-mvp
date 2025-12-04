import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IApplication extends Document {
    user_id: Types.ObjectId;
    scholarship_id: Types.ObjectId;
    status: 'pending' | 'approved' | 'rejected';
    motivation?: string;
    created_at: Date;
}

const application_schema = new Schema<IApplication>(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        scholarship_id: { type: Schema.Types.ObjectId, ref: 'Scholarship', required: true },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        motivation: { type: String },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Evitar duplicados: Un usuario no puede postularse 2 veces a la misma beca
application_schema.index({ user_id: 1, scholarship_id: 1 }, { unique: true });

const Application = mongoose.model<IApplication>('Application', application_schema);
export default Application;