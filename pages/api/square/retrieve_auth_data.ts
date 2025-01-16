import { NextApiResponse } from 'next'
import { NextApiUserRequest } from '../../../types'
import { AuthStatus } from '../../../types/user'
import createClient from '../../../utils/supabase/api'


async function handler(req: NextApiUserRequest, res: NextApiResponse) {
    const supabase = createClient(req, res)
    const {data: {user} } = await supabase.auth.getUser()
    if (!user?.email) {
        throw new Error("Missing user email")
    }

    const isAuthed = user?.app_metadata?.squareData?.tokens ? true : false
    const userDeniedSquare = user?.app_metadata?.squareData?.userDeniedSquare ? true : false

    const authStatus: AuthStatus = {
        isAuthed,
        userDeniedSquare
    }
    res.status(200).json(authStatus)

}

export default handler