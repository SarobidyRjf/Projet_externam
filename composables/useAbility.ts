// composables/useAbility.ts
import { createMongoAbility, type AnyMongoAbility } from '@casl/ability';
import { ref } from 'vue';

const ability = ref<AnyMongoAbility | null>(null);
const user = ref<any>(null);

export async function loadUserAbility() {
  const res = await fetch('/api/auth/me');
  if (!res.ok) throw new Error('Unauthorized');

  const { user: u, abilities } = await res.json();
  ability.value = createMongoAbility(abilities);
  user.value = u;

  return { user: user.value, ability: ability.value };
}

export function useAbility() {
  return ability;
}

export function useCurrentUser() {
  return user;
}
