import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProjectApplication extends Document {
    project_id: Types.ObjectId;
    user_id: Types.ObjectId;
    mode: 'solo' | 'team';
    desired_role: string;
    motivation: string;
    status: 'pending' | 'assigned' | 'rejected';
    created_at: Date;
}

const application_schema = new Schema<IProjectApplication>(
    {
        project_id: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        mode: { type: String, enum: ['solo', 'team'], required: true },
        desired_role: { type: String, required: true },
        motivation: { type: String, required: true },
        status: { type: String, enum: ['pending', 'assigned', 'rejected'], default: 'pending' }
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const ProjectApplication = mongoose.model<IProjectApplication>('ProjectApplication', application_schema);
export default ProjectApplication;