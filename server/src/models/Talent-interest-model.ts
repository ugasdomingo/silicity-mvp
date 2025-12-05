import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITalentInterest extends Document {
    company_id: Types.ObjectId;
    talent_id: Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    message?: string; // Mensaje personalizado de la empresa
    created_at: Date;
}

const interest_schema = new Schema<ITalentInterest>(
    {
        company_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        talent_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
        message: String
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Evitar spam: Una empresa no puede enviar múltiples solicitudes pendientes al mismo talento
interest_schema.index({ company_id: 1, talent_id: 1, status: 1 }, { unique: true });

const TalentInterest = mongoose.model<ITalentInterest>('TalentInterest', interest_schema);
export default TalentInterest;