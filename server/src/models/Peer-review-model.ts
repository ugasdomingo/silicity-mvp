import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPeerReview extends Document {
    project_id: Types.ObjectId;
    reviewer_id: Types.ObjectId; // Quién evalúa
    reviewed_id: Types.ObjectId; // A quién evalúa

    ratings: {
        communication: number; // 1-5
        collaboration: number; // 1-5
        technical_contribution: number; // 1-5
    };
    comment: string; // Feedback cualitativo (Anónimo para el receptor, visible para Admin/Empresa)
}

const peer_review_schema = new Schema<IPeerReview>(
    {
        project_id: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
        reviewer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        reviewed_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },

        ratings: {
            communication: { type: Number, min: 1, max: 5, required: true },
            collaboration: { type: Number, min: 1, max: 5, required: true },
            technical_contribution: { type: Number, min: 1, max: 5, required: true }
        },
        comment: { type: String }
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Evitar doble evaluación
peer_review_schema.index({ project_id: 1, reviewer_id: 1, reviewed_id: 1 }, { unique: true });

const PeerReview = mongoose.model<IPeerReview>('PeerReview', peer_review_schema);
export default PeerReview;