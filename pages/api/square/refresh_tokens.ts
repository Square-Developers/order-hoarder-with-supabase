import { NextApiResponse } from 'next'
import { AppError, InternalServerError, NextApiUserRequest, SquareData } from '../../../types'
import { decryptToken, encryptToken, saveSupabaseData } from '../../../utils/server-helpers'
import createClient from '../../../utils/supabase/api'
import { getUserClient } from '../../../utils/square-client'

(BigInt.prototype as any).toJSON = function () {
    return this.toString()
}

async function handler(req: NextApiUserRequest, res: NextApiResponse) {
     try{
        const supabase = createClient(req, res)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return res.status(401).json({ locations: [], isTokenValid: false })
        }

        const { accessToken, refreshToken } = decryptToken(user?.app_metadata?.squareData?.tokens, user?.app_metadata?.squareData?.iv)
        const { oAuthApi } = getUserClient(accessToken)
        try {
            if (typeof process.env.APP_ID !== 'string') {
                throw new AppError('APP_ID is not set - check .env file')
            }
            const { result } = await oAuthApi.obtainToken({
                clientId: process.env.APP_ID,
                refreshToken,
                grantType: 'refresh_token'
            })
    
            const {encrypted, iv} = encryptToken(JSON.stringify({accessToken: result.accessToken, refreshToken: result.refreshToken}))
            const content: SquareData = {
                tokens: encrypted,
                iv,
                expiresAt: result.expiresAt,
                merchantId: result.merchantId
            }
    
            await saveSupabaseData({
                user,
                squareData: content
            })
        } catch (e) {
            console.error('error: ', e)
            throw new InternalServerError('Error refreshing tokens', 500)
        }

        res.status(200).json(({
            message: 'successfully refreshed tokens'
        }))

    } catch (error) {
        res.status(400).json(error)
    }
}

export default handler
