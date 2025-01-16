import crypto from 'crypto'
import { BadRequestError, DatabaseError, ForbiddenError, InternalServerError, NotFoundError, SquareData, Tokens, UnauthorizedError } from '../types'
import { getOauthClient, getUserClient } from './square-client'
import { NextApiResponse } from 'next'
import createAdminClient from './supabase/admin'
import { User } from '@supabase/supabase-js'

export const checkToken = async (tokens: string, iv: string) => {
    const { accessToken } = decryptToken(tokens, iv)
    const { oAuthApi } = getUserClient(accessToken)
    // If this request fails, with 401, we know the token is invalid, and either expired or been revoked
    try{
        const { result } = await oAuthApi.retrieveTokenStatus();
        return result
    } catch(e) {
        console.log('error: ', e)
        return { merchantId: null, statusCode: 401 }
    }
}

export const encryptToken = function (tokens: string) {
    if (!process.env.REACT_AES_KEY) {
        console.error('REACT_AES_KEY is not set - check .env file')
        throw new InternalServerError('Internal Server Error', 500)
    }
    const iv = crypto.randomBytes(16).toString('hex').substring(0, 16)
    const algorithm = 'aes-256-cbc'
    const key: crypto.CipherKey = process.env.REACT_AES_KEY
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(tokens, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return {
        iv,
        encrypted
    }
}

export const decryptToken = function (tokens: string, iv: string): Tokens {
    if (!process.env.REACT_AES_KEY) {
        console.error('REACT_AES_KEY is not set - check .env file')
        throw new InternalServerError('Internal Server Error', 500)
    }
    const algorithm = 'aes-256-cbc'
    const key: crypto.CipherKey = process.env.REACT_AES_KEY
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(tokens, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return JSON.parse(decrypted)
}

export const getAuthUrlValues = () => {
    const base64Encode = (str: Buffer) => {
        return str.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '')
    }

    const codeVerifier = base64Encode(crypto.randomBytes(32))

    const sha256 = (buffer: string) => {
        return crypto.createHash('sha256').update(buffer).digest()
    }
    const codeChallenge = base64Encode(sha256(codeVerifier))

    const state = base64Encode(crypto.randomBytes(12))

    // Set the code verifier and state in local storage so we can check it later
    const squareCodeVerifier = codeVerifier
    const squareState = state
    return {
        squareCodeChallenge: codeChallenge,
        squareCodeVerifier,
        squareState,
        baseURl: process.env.SQUARE_BASE_URL,
        appId: process.env.APP_ID,
    }
}


export const saveSupabaseData = async ({user, squareData}: {
    user: User;
    squareData: SquareData;
}) => {

    let newSquareData = {}
    // case: Deauthorizing the user
    if (Object.keys(squareData).length === 0) {
        newSquareData = {}
    }
    // case: updating the existing squareData
    else if (user?.app_metadata?.squareData?.tokens) {
        newSquareData = {
            ...user?.app_metadata?.squareData, ...squareData
        }
    // case: first time creating squareData
    } else {
        newSquareData = squareData
    }

    // Create admin client to update app_metadata
    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
        user.id, {
            app_metadata: {
                squareData: newSquareData
            }
        }
    )
    if (error) {
        throw new Error('Failed to update user: ' + error.message)
    }
}

export const errorResponse = (res: NextApiResponse, err: any) => {
    switch(true) {
        case err instanceof BadRequestError:
            return res.status(err.statusCode).json({
                message: err.message
            })
        case err instanceof UnauthorizedError:
            return res.status(err.statusCode).json({
                message: err.message
            })
        case err instanceof ForbiddenError:
            return res.status(err.statusCode).json({
                message: err.message
            })
        case err instanceof NotFoundError:
            return res.status(err.statusCode).json({
                message: err.message
            })
        case err instanceof DatabaseError:
            return res.status(err.statusCode).json({
                message: err.message
            })
        case err instanceof InternalServerError:
            return res.status(err.statusCode).json({
                message: err.message
            })
        default:
            return res.status(500).json({
                message: 'Internal Server Error'
            })       
    }
}