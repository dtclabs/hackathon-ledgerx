export interface INavMenuSection {
  title: string
  icon?: any
  routes: INavMenuItem[]
  whitelistEnvironment?: string[]
}

interface INavMenuItem {
  title: string
  icon?: any
  active?: boolean
  match: string
  path: string
  blacklistRole?: string[]
  description?: string
  children?: INavMenuItem[]
  whitelistEnvironment?: string[]
}
