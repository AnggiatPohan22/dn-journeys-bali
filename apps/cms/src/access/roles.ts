import type { Access, FieldAccess } from 'payload'

// ─── Role Checkers ───────────────────────────────────────

export const isEditor: Access = ({ req: { user } }) => {
  return !!user // any authenticated user
}

export const isAdmin: Access = ({ req: { user } }) => {
  if (!user) return false
  return ['admin', 'super-admin'].includes(user.role)
}

export const isSuperAdmin: Access = ({ req: { user } }) => {
  if (!user) return false
  return user.role === 'super-admin'
}

// ─── Collection-level Access ─────────────────────────────

/** Anyone authenticated can read */
export const authenticatedRead: Access = ({ req: { user } }) => !!user

/** Admin+ can create new entries */
export const adminCreate: Access = isAdmin

/** Any authenticated user can update (field-level restricts what) */
export const authenticatedUpdate: Access = ({ req: { user } }) => !!user

/** Only super-admin can delete */
export const superAdminDelete: Access = isSuperAdmin

// ─── Field-level Access ──────────────────────────────────

/** Only admin+ can see/edit this field */
export const adminFieldAccess: FieldAccess = ({ req: { user } }) => {
  if (!user) return false
  return ['admin', 'super-admin'].includes(user.role)
}

/** Only super-admin can see/edit this field */
export const superAdminFieldAccess: FieldAccess = ({ req: { user } }) => {
  if (!user) return false
  return user.role === 'super-admin'
}
