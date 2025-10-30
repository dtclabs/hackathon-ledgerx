import auth0 from 'auth0-js'

interface IAuth0InitParams {
  path: string
  authO?: {
    domain?: string
    clientID?: string
    redirectUri?: string
    audience?: string
    responseType?: string
  }
}

class Auth0Service {
  client: any

  constructor() {
    this.client = new auth0.WebAuth({
      domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
      clientID: process.env.NEXT_PUBLIC_AUTH0_CLIENTID,
      audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE
    })
  }
}

export default Auth0Service
