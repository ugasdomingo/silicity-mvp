import jwt, { SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';

// Access Token (15 min)
export const generate_access_token = (user_id: Types.ObjectId): string => {
    const secret = process.env.JWT_SECRET as jwt.Secret;
    const expires_in = process.env.JWT_EXPIRE as SignOptions['expiresIn'];

    return jwt.sign({ user_id }, secret, {
        expiresIn: expires_in || '15m',
    });
};

// Refresh Token (30 días)
export const generate_refresh_token = (user_id: Types.ObjectId): string => {
    const secret = process.env.JWT_REFRESH_SECRET as jwt.Secret;
    const expires_in = process.env.JWT_REFRESH_EXPIRE as SignOptions['expiresIn'];

    return jwt.sign({ user_id }, secret, {
        expiresIn: expires_in || '30d',
    });
};