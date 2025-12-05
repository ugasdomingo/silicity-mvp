import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGroupMessage extends Document {
    group_id: Types.ObjectId;
    user_id: Types.ObjectId;
    message: string;
    created_at: Date;
}

const message_schema = new Schema<IGroupMessage>(
    {
        group_id: { type: Schema.Types.ObjectId, ref: 'StudyGroup', required: true },
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true, trim: true }
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Índice para buscar mensajes por grupo rápidamente
message_schema.index({ group_id: 1, created_at: 1 });

const GroupMessage = mongoose.model<IGroupMessage>('GroupMessage', message_schema);
export default GroupMessage;