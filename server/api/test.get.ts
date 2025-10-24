// server/api/users.ts
import { connectToDB } from '~/server/utils/mongoose'
import { Teste } from '~/server/models/teste.schema'


export default defineEventHandler(async (event) => {
  await connectToDB()
  const user = event.context.auth
   return console.log('User:', user)
  
})
