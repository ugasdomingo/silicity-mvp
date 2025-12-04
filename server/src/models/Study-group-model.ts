import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStudyGroup extends Document {
    name: string;
    topic: string;
    description: string;
    members: Types.ObjectId[]; // IDs de usuarios
    admin_id?: Types.ObjectId; // Si es grupo de estudio normal, hay un líder. Si es proyecto, puede ser null o el Admin.

    // --- CAMPOS NUEVOS PARA PROYECTOS ---
    is_project_team: boolean; // True si fue creado por Admin para un proyecto
    project_reference?: Types.ObjectId; // Link al proyecto (opcional)

    status: 'open' | 'closed'; // 'closed' no acepta más gente (default para proyectos)
    visibility: 'public' | 'hidden'; // 'hidden' no sale en buscador (default para proyectos)

    created_at: Date;
}

const group_schema = new Schema<IStudyGroup>(
    {
        name: { type: String, required: true, trim: true },
        topic: { type: String, required: true },
        description: { type: String },
        members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        admin_id: { type: Schema.Types.ObjectId, ref: 'User' },

        // Configuración Híbrida
        is_project_team: { type: Boolean, default: false },
        project_reference: { type: Schema.Types.ObjectId, ref: 'Project' },

        status: { type: String, enum: ['open', 'closed'], default: 'open' },
        visibility: { type: String, enum: ['public', 'hidden'], default: 'public' }
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const StudyGroup = mongoose.model<IStudyGroup>('StudyGroup', group_schema);
export default StudyGroup;