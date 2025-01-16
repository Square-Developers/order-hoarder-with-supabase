import { GetServerSidePropsContext } from 'next'
import { LoginSignup } from '../../components/LoginSignup'
import { createClient } from '../../utils/supabase/server-props'

const Signup = () => {

    return (
        <LoginSignup variation='signup' />
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const supabase = createClient(context)
  
    const { data, error } = await supabase.auth.getUser()
    if (data.user) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
      }
    }
  
    return {
      props: {},
    }
  }

export default Signup
