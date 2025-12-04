import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProjectDelivery extends Document {
    project_id: Types.ObjectId;
    group_id: Types.ObjectId; // El equipo que entrega

    // Contenido de la entrega
    documentation_link: string; // Link a Drive/Docs
    repo_link?: string; // Link a GitHub (opcional)
    demo_link?: string; // Link a video/deploy (opcional)

    // Evaluación de la Empresa
    company_evaluation: {
        status: 'pending' | 'reviewed';
        rating: 'positive' | 'improvable' | 'negative'; // Tu escala de valoración
        feedback_text: string;
    };

    // Negociación
    outcomes: {
        ip_purchase_interested: boolean; // ¿Quieren comprar derechos?
        hiring_interested: boolean; // ¿Quieren contratar al equipo/miembros?
        admin_notes?: string; // Notas internas del admin sobre el pago de IP
    };

    submitted_at: Date;
}

const delivery_schema = new Schema<IProjectDelivery>(
    {
        project_id: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
        group_id: { type: Schema.Types.ObjectId, ref: 'StudyGroup', required: true },

        documentation_link: { type: String, required: true },
        repo_link: String,
        demo_link: String,

        company_evaluation: {
            status: { type: String, enum: ['pending', 'reviewed'], default: 'pending' },
            rating: { type: String, enum: ['positive', 'improvable', 'negative'] }, // Sin default, se pone al revisar
            feedback_text: String
        },

        outcomes: {
            ip_purchase_interested: { type: Boolean, default: false },
            hiring_interested: { type: Boolean, default: false },
            admin_notes: String
        },

        submitted_at: { type: Date, default: Date.now }
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const ProjectDelivery = mongoose.model<IProjectDelivery>('ProjectDelivery', delivery_schema);
export default ProjectDelivery;