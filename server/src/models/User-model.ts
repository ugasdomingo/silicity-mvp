import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import bcrypt from 'bcryptjs';

// ============================================
// 📝 INTERFACE
// ============================================
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    password_reset_token?: string;
    password_reset_expires?: Date;
    role: 'user' | 'student' | 'talent' | 'company' | 'vc' | 'Admin';
    account_status: 'active' | 'pending_approval' | 'suspended';
    payment_status: 'unpaid' | 'pending' | 'active' | 'free_trial';
    is_verified: boolean;
    verification_code: string;
    verification_code_expires?: Date;    // 🆕 Expiración del código
    verification_attempts?: number;       // 🆕 Contador de intentos fallidos
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

// ============================================
// 📐 SCHEMA
// ============================================
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
        password_reset_token: {
            type: String,
            select: false
        },
        password_reset_expires: {
            type: Date,
            select: false
        },
        role: {
            type: String,
            enum: ['user', 'student', 'talent', 'company', 'vc', 'Admin'],
            default: 'user',
        },
        account_status: {
            type: String,
            enum: ['active', 'pending_approval', 'suspended'],
            default: 'active',
        },
        payment_status: {
            type: String,
            enum: ['unpaid', 'pending', 'active', 'free_trial'],
            default: 'active',
        },
        is_verified: {
            type: Boolean,
            default: false,
        },
        verification_code: {
            type: String,
            select: false,
        },
        // 🆕 Expiración del código de verificación (15 min desde creación)
        verification_code_expires: {
            type: Date,
            select: false,
        },
        // 🆕 Contador de intentos fallidos de verificación (máx 5)
        verification_attempts: {
            type: Number,
            default: 0,
            select: false,
        },
        psych_evaluation: {
            status: {
                type: String,
                enum: ['not_required', 'pending_payment', 'scheduled', 'passed', 'failed'],
                default: 'not_required'
            },
            report_url: String,
            authorized_viewers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
        },
        profile: {
            avatar: String,
            headline: String,
            bio: String,
            skills: [String],
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

// ============================================
// 🔐 MIDDLEWARE: Encriptar password
// ============================================
user_schema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

});

// ============================================
// 🔑 MÉTODO: Comparar password
// ============================================
user_schema.methods.match_password = async function (entered_password: string): Promise<boolean> {
    return await bcrypt.compare(entered_password, this.password);
};

// ============================================
// 📇 ÍNDICES
// ============================================
// Índice para búsqueda de talentos en vitrina
user_schema.index({ role: 1, payment_status: 1, 'reputation.is_top_talent': 1 });

const User = mongoose.model<IUser>('User', user_schema);
export default User;
