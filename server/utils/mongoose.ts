import mongoose from 'mongoose'

const globalAny = global as any

export const connectToDB = async () => {
  if (globalAny.mongoose) return

  const config = useRuntimeConfig()
  const mongoUri = config.mongoUri || process.env.MONGO_URI
  if (!mongoUri) {
    throw new Error('MongoDB URI is not defined')
  }
  console.log('uri:', mongoUri)
  try {
    await mongoose.connect(mongoUri)
    globalAny.mongoose = mongoose.connection
    console.log('✅ MongoDB connecté')
  } catch (err) {
    console.error('❌ Connexion MongoDB échouée :', err)
  }
}
