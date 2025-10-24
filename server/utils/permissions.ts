// Simple shared validation for role permissions

type Permission = { action: string; subject: string; conditions?: Record<string, any> | null }

const ALLOWED_ACTIONS = new Set(['read', 'create', 'update', 'delete', 'publish', 'manage', 'search'])

export function validatePermissionsPayload(perms: Permission[]): string | null {
  for (const p of perms) {
    if (!p || typeof p !== 'object') return 'Permission invalide'
    if (!p.action || !ALLOWED_ACTIONS.has(String(p.action))) return `Action invalide: ${p.action}`
    if (!p.subject || typeof p.subject !== 'string') return 'Sujet invalide'
  }
  return null
}

export { ALLOWED_ACTIONS }


