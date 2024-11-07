import { NextApiResponse } from 'next'
import { NextApiUserRequest } from '../../../types'
import { checkToken } from '../../../utils/server-helpers'
import createClient from '../../../utils/supabase/api'

(BigInt.prototype as any).toJSON = function () {
    return this.toString()
}

// This endpoint solely exists to the Frontend can check if the user's token is still valid
async function handler(req: NextApiUserRequest, res: NextApiResponse) {
    try {
        const supabase = createClient(req, res)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return res.status(401).json({ isTokenValid: false })
        }
        if (!user?.app_metadata?.squareData?.tokens) {
            return res.status(200).json({ isTokenValid: false })
        }
        
        const result = await checkToken(user?.app_metadata?.squareData?.tokens, user?.app_metadata?.squareData?.iv)

        
        if (result.merchantId) {
            return res.status(200).json({ isValid: true })
        } else {
            return res.status(200).json({ isValid: false })
        }
    } catch (e: any) {
        if (e.statusCode === 401) {
            return res.status(200).json({ isValid: false })
        } else {
            console.error('error: ', e)
            return res.status(200).json({ isValid: false })
        }
    }
}

export default handler
