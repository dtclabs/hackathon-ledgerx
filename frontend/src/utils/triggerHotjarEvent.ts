enum ENVIROMENT {
  PROD = 'production',
  STAGING = 'staging',
  DEV = 'development'
}

export const triggerHotjarEvent = () => {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT || ENVIROMENT.DEV
  if (typeof window !== 'undefined' && window.hj) {
    window.hj('event', `free_transaction_success_${env}`)
  }
}
