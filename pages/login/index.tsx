import { GetServerSidePropsContext } from 'next'
import { LoginSignup } from '../../components/LoginSignup'
import { createClient } from '../../utils/supabase/server-props'


const Login = () => {

    return (
        <>
            <LoginSignup variation='login' />
        </>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const supabase = createClient(context)
  
    const { data } = await supabase.auth.getUser()
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

export default Login
