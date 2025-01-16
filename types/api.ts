import { Session, User } from '@supabase/supabase-js';
import { NextApiRequest } from 'next'

export interface NextApiUserRequest extends NextApiRequest {
    user: { username: string }
}

export interface RefreshTokenResponse {
    message: string
}

export interface SignUpLoginResponse {
    data: {
        user: User;
        session: Session;
    }
    error: string
}