import mongoose, { Schema, Document } from 'mongoose';

export interface IScholarship extends Document {
    title: string;
    provider: string;
    description: string;
    requirements: string[];
    deadline: Date;
    spots: number;
    image_url?: string;
    status: 'open' | 'closed';
    auto_approve: boolean;
    created_at: Date;
}

const scholarship_schema = new Schema<IScholarship>(
    {
        title: { type: String, required: true, trim: true },
        provider: { type: String, required: true },
        description: { type: String, required: true },
        requirements: [{ type: String }],
        deadline: { type: Date, required: true },
        spots: { type: Number, default: 1 },
        image_url: { type: String, default: 'https://via.placeholder.com/400x200?text=Beca+Silicity' },
        status: { type: String, enum: ['open', 'closed'], default: 'open' },
        auto_approve: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const Scholarship = mongoose.model<IScholarship>('Scholarship', scholarship_schema);
export default Scholarship;