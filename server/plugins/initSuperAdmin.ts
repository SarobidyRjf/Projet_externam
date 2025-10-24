import { User } from '~/server/models/user/user.schema'
import bcrypt from 'bcrypt'
import { connectToDB } from '~/server/utils/mongoose'
import { Role } from '~/server/models/role/role.schema'

export default defineNitroPlugin(async (nitroApp) => {
  console.log('Initializing...')
  await connectToDB()

  const superAdminEmail = 'superadmin@example.com'
  const superAdminPassword = 'lechatsur'

  // Trouver ou créer le rôle super_admin
  let superAdminRole = await Role.findOne({ name: 'super_admin' })

  if (!superAdminRole) {
    superAdminRole = await Role.create({
      name: 'super_admin',
      permissions: [
        {
          action: 'manage',
          subject: 'all',
        },
      ],
    })
    console.log('✅ Role super_admin created!')
  }

  // Vérifier si l'utilisateur existe déjà
  const existing = await User.findOne({ email: superAdminEmail })

  if (!existing) {
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10)

    await User.create({
      email: superAdminEmail,
      password: hashedPassword,
      role: superAdminRole._id, // Référence au document Role
      nom: 'Super',
      prenom: 'Admin',
      matricule: 'L001',
      metier: 'CEO',
    })

    console.log('✅ Superadmin created!')
  } else {
    console.log('ℹ️ Superadmin already exists')
  }
})

