import { useState } from 'react'
import { useRootfiLink } from 'rootfi-react-sdk'

const useRootfiSDK = () => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [inviteLinkId, setInviteLinkId] = useState<string>('')

  const onHandleSuccess = () => {
    setIsSuccess(true)
    setTimeout(() => closeLink(), 2000)
  }

  const { isReady, closeLink, openLink } = useRootfiLink({
    environment: 'global',
    inviteLinkId,
    onSuccess: onHandleSuccess,
    onExit: () => {
      closeLink()
    }
  })

  return { isReady, openLink, closeLink, isSuccess, setInviteLinkId }
}

export default useRootfiSDK
