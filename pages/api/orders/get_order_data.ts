import { NextApiResponse } from 'next'
import { getUserClient } from '../../../utils/square-client'
import { decryptToken } from '../../../utils/server-helpers'
import { NextApiUserRequest } from '../../../types'
import createClient from '../../../utils/supabase/api'

(BigInt.prototype as any).toJSON = function () {
    return this.toString()
}
async function handler(req: NextApiUserRequest, res: NextApiResponse) {
    const supabase = createClient(req, res)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return res.status(401).json({ orders: [], isTokenValid: false })
    }
        
    const { accessToken } = decryptToken(user?.app_metadata?.squareData?.tokens, user?.app_metadata?.squareData?.iv)
    const { ordersApi } = getUserClient(accessToken)
    const { result } = await ordersApi.searchOrders({
        locationIds: [
            req.body.id
        ],
        query: {
            filter: {
                stateFilter: {
                    states: [
                        'COMPLETED',
                        'OPEN'
                    ]
                },
            }
        }
    })
    return res.status(200).json(result)

}



export default handler