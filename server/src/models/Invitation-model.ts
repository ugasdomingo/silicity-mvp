import mongoose, { Schema, Document } from 'mongoose';

export interface IInvitation extends Document {
    token: string;
    role: 'company' | 'vc';
    email?: string; // Opcional: si quieres restringir la invitación a un email específico
    is_used: boolean;
    expires_at: Date;
}

const invitation_schema = new Schema<IInvitation>(
    {
        token: { type: String, required: true, unique: true },
        role: { type: String, required: true, enum: ['company', 'vc'] },
        email: { type: String },
        is_used: { type: Boolean, default: false },
        expires_at: { type: Date, required: true },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const Invitation = mongoose.model<IInvitation>('Invitation', invitation_schema);
export default Invitation;