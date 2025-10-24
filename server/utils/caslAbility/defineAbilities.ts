// utils/ability.ts
import { AbilityBuilder, createMongoAbility } from '@casl/ability'
import { Role } from '~/server/models/role/role.schema'

interface UserType {
  _id: string;
  email: string;
  role: string;
  nom: string;
  prenom: string;
  matricule: string;
  metier: string;
}
interface Permission {
  action: string;
  subject: string;
  conditions?: Record<string, any>;
}

export async function defineAbilitiesForUser(user: UserType) {
  const { can, build } = new AbilityBuilder(createMongoAbility);

  const role = await Role.findById(user.role);
  if (!role) return build();

  for (const perm of role.permissions as Permission[]) {
    const conditions = parseConditions(perm.conditions, user);
    can(perm.action, perm.subject, conditions || undefined);
  }

  return build();
}

function parseConditions(conditions: any, user: UserType) {
  if (!conditions) return null;

  // Remplace les variables comme ${user._id} par leur valeur
  const str = JSON.stringify(conditions);
  const replaced = str.replace(/\$\{user\.(.*?)\}/g, (_, prop) => user[prop as keyof UserType]);
  return JSON.parse(replaced);
}
