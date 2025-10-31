/* eslint-disable react/no-unescaped-entities */
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { Button } from '@/components-v2/Button'

const NotFoundPage: NextPage = (props) => {
  const router = useRouter()

  const handleRedirectToSignin = () => {
    router.push({
      pathname: '/'
    })
  }

  return (
    <div className="flex h-screen justify-center items-center" style={{ backgroundColor: '#FBFAFA' }}>
      <div className="block rounded-lg shadow-lg bg-white max-w-sm font-inter">
        <div className="p-6">
          <p className="text-center mb-4">LedgerX.</p>
          <h3 className="text-xl mt-2  text-center">Oops! You shouldnt be here</h3>
          <p className="text-xs text-center mt-2">The page you're trying to access doesn't exist</p>
        </div>

        <hr />
        <div className="p-4 flex gap-4 flex-row">
          <Button variant="contained" color="primary" onClick={handleRedirectToSignin} fullWidth>
            Proceed to login screen
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
