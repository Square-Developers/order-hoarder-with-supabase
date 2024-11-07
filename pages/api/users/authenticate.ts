import { NextApiResponse } from 'next'
import { NextApiUserRequest } from '../../../types'
import { errorResponse } from '../../../utils/server-helpers'
import createClient from '../../../utils/supabase/api'


export default function handler(req: NextApiUserRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'POST':
            return authenticate()
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    async function authenticate() {
        try {
            const { username, password } = req.body
            const supabase = createClient(req,res)

            const { error } = await supabase.auth.signInWithPassword({
                email: username,
                password: password,
              })
              if (error) {
                return res.status(error?.status || 500).json({error: error.code})
              } else {
                return res.status(200).json({})
              }
        } catch (e) {
            return errorResponse(res, e)
        }
    }
}