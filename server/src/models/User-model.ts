import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'student' | 'talent' | 'company' | 'vc' | 'Admin';
    payment_status: 'unpaid' | 'pending' | 'active' | 'free_trial';
    is_verified: boolean;
    verification_code: string;
    psych_evaluation: {
        status: string;
        report_url: string;
        authorized_viewers: ObjectId[];
    };
    profile: {
        avatar: string;
        headline: string;
        bio: string;
        skills: string[];
        social_links: {
            linkedin: string;
            github: string;
            portfolio: string;
        };
    };
    company_info: {
        description: string;
        website: string;
    };
    terms_and_privacy_accepted: boolean;
    reputation: {
        projects_completed: number;
        positive_reviews: number;
        is_top_talent: boolean;
    };
    match_password(entered_password: string): Promise<boolean>;
}

const user_schema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Por favor ingrese su nombre'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Por favor ingrese su email'],
            unique: true,
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
                'Por favor ingrese un email válido',
            ],
        },
        password: {
            type: String,
            required: [true, 'Por favor ingrese una contraseña'],
            minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
            select: false,
        },
        role: {
            type: String,
            enum: ['user', 'student', 'talent', 'company', 'vc', 'Admin'],
            default: 'user', // Por defecto entran al plan gratuito
        },
        payment_status: {
            type: String,
            enum: ['unpaid', 'pending', 'active', 'free_trial'],
            default: 'active', // Para 'user' es active por defecto (es gratis)
        },
        is_verified: {
            type: Boolean,
            default: false,
        },
        verification_code: {
            type: String,
            select: false,
        },
        psych_evaluation: {
            status: {
                type: String,
                enum: ['not_required', 'pending_payment', 'scheduled', 'passed', 'failed'],
                default: 'not_required'
            },
            report_url: String, // Link al Drive (Solo Admin/Empresa autorizada lo ve)
            authorized_viewers: [{ type: Schema.Types.ObjectId, ref: 'User' }] // Empresas que pueden ver el reporte
        },
        profile: {
            avatar: String,
            headline: String, // "Fullstack Dev"
            bio: String,      // Descripción de sí mismo
            skills: [String], // Habilidades
            social_links: {
                linkedin: String,
                github: String,
                portfolio: String
            },
        },
        company_info: {
            description: String,
            website: String
        },
        terms_and_privacy_accepted: {
            type: Boolean,
            default: false
        },
        reputation: {
            projects_completed: { type: Number, default: 0 },
            positive_reviews: { type: Number, default: 0 },
            is_top_talent: { type: Boolean, default: false }
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

// Middleware: Encriptar password antes de guardar
user_schema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Método: Comparar password
user_schema.methods.match_password = async function (entered_password: string): Promise<boolean> {
    return await bcrypt.compare(entered_password, this.password);
};

const User = mongoose.model<IUser>('User', user_schema);
export default User;
