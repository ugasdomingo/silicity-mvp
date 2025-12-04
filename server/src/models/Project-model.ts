import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProject extends Document {
    company_id: Types.ObjectId;
    title: string;
    description: string;
    requirements: string[]; // Roles/Perfiles buscados

    status: 'pending_review' | 'open' | 'in_progress' | 'completed' | 'canceled';

    // Equipos asignados por el Admin para resolver este reto
    participating_groups: Types.ObjectId[];

    created_at: Date;
}

const project_schema = new Schema<IProject>(
    {
        company_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        requirements: [{ type: String }],

        status: {
            type: String,
            enum: ['pending_review', 'open', 'in_progress', 'completed', 'canceled'],
            default: 'pending_review'
        },

        // Referencia a los StudyGroups que actúan como equipos
        participating_groups: [{ type: Schema.Types.ObjectId, ref: 'StudyGroup' }]
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const Project = mongoose.model<IProject>('Project', project_schema);
export default Project;