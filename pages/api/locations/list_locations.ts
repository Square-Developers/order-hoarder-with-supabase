import { NextApiResponse } from 'next'
import { NextApiUserRequest } from '../../../types'

import { getUserClient } from '../../../utils/square-client'
import { decryptToken } from '../../../utils/server-helpers'
import createClient from '../../../utils/supabase/api'
(BigInt.prototype as any).toJSON = function () {
    return this.toString()
}

async function handler(req: NextApiUserRequest, res: NextApiResponse) {
    const supabase = createClient(req, res)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return res.status(401).json({ locations: [], isTokenValid: false })
    }
        
    const { accessToken } = decryptToken(user?.app_metadata?.squareData?.tokens, user?.app_metadata?.squareData?.iv)
    const { locationsApi } = getUserClient(accessToken)
    try {
        const { result } = await locationsApi.listLocations()
        return res.status(200).json({ ...result,
isTokenValid: true })
    } catch (e) {
        return res.status(400).json(e)
    }
}

export default handler
