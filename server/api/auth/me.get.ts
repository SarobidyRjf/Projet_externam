import { getUserFromSession } from "~/server/utils/getUserFromSessions";
import { defineAbilitiesForUser } from "~/server/utils/caslAbility/defineAbilities";

export default defineEventHandler(async (event) => {
    const user = await getUserFromSession(event);

  // 2. Construire abilities CASL côté serveur
  const ability = await defineAbilitiesForUser(user);

  // 3. Retourner user + règles CASL
  return {
    user,
    abilities: ability.rules
  };
})
