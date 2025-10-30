import { ERole } from '../../roles/interfaces'
import { Role } from '../entity-services/roles/role.entity'

export const accessControlHelper = {
  canUserSetRole
}

function canUserSetRole(param: { currentUserRole: Role; changeToRole: ERole }) {
  switch (param.currentUserRole.name) {
    case ERole.Admin: {
      if (param.changeToRole === ERole.Owner) {
        return false
      }
    }
  }
  return true
}
