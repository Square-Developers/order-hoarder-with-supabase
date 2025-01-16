
import { NextApiRequest, NextApiResponse } from 'next'
import { RevokeTokenResponse } from 'square'
import { decryptToken, errorResponse } from '../../../utils/server-helpers'
import createClient from '../../../utils/supabase/api'
import createAdminClient from '../../../utils/supabase/admin'
import { getOauthClient } from '../../../utils/square-client'

// TODO:Confirm all errors make sense
async function handler(req: NextApiRequest, res: NextApiResponse<RevokeTokenResponse>) {
    switch (req.method) {
        case 'POST':
            return deauthorize()
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    async function deauthorize() {
        try{

            const supabase = createClient(req, res)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                return res.status(401).json({})
            }
            const revokeOnlyAccessToken = req?.body?.revokeToken ? true : false


            const { accessToken } = decryptToken(user?.app_metadata?.squareData?.tokens, user?.app_metadata?.squareData?.iv)
            const properClientSecret = 'Client ' + process.env.APPLICATION_SECRET
            const oAuthApi = getOauthClient()
            const { result } = await oAuthApi.revokeToken({
                clientId: process.env.APP_ID,
                accessToken,
                revokeOnlyAccessToken
            }, properClientSecret)

            if (!revokeOnlyAccessToken) {
                const adminSupabase = createAdminClient()
                const { error } = await adminSupabase.auth.admin.updateUserById(
                    user.id,
                    { app_metadata: {
                        squareData: {}
                    } }
                  )
                  if (error) {
                   console.log('failed to update user: ', error)
                  }
            }

            return res.status(200).json(result)
        } catch (e) {
            return errorResponse(res, e)
        }
    }
}

export default handler