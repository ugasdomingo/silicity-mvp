import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAppointment extends Document {
    user_id: Types.ObjectId;
    cal_booking_id: number; // ID numérico de Cal.com
    type: 'psych_evaluation' | 'orientation';
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
    start_time: Date;
    end_time: Date;
    meeting_url?: string;
    created_at: Date;
}

const appointment_schema = new Schema<IAppointment>(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        cal_booking_id: { type: Number, required: true, unique: true },
        type: { type: String, enum: ['psych_evaluation', 'orientation'], required: true },
        status: {
            type: String,
            enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
            default: 'scheduled'
        },
        start_time: { type: Date, required: true },
        end_time: { type: Date, required: true },
        meeting_url: { type: String }
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const Appointment = mongoose.model<IAppointment>('Appointment', appointment_schema);
export default Appointment;