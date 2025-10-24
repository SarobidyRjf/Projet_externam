import mongoose, { Schema, type Model } from 'mongoose'

export type SoftwareField = {
  key: string
  value: string
}

export type SoftwareDocument = {
  label: string
  fields: SoftwareField[]
  createdAt?: Date
  updatedAt?: Date
}

const keyValueSchema = new Schema<SoftwareField>(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true }
  },
  { _id: false }
)

const createSoftwareModel = (modelName: string): Model<SoftwareDocument> => {
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName] as Model<SoftwareDocument>
  }

  const schema = new Schema<SoftwareDocument>(
    {
      label: { type: String, required: true, trim: true },
      fields: {
        type: [keyValueSchema],
        default: []
      }
    },
    {
      timestamps: true
    }
  )

  return mongoose.model<SoftwareDocument>(modelName, schema)
}

export const Logiciel = createSoftwareModel('Logiciel')
export const LogicielIA = createSoftwareModel('LogicielIA')
export const VoixIA = createSoftwareModel('VoixIA')

export const SOFTWARE_MODEL_MAP = {
  logiciel: Logiciel,
  logicielIA: LogicielIA,
  voixIA: VoixIA
} as const

export type SoftwareCategory = keyof typeof SOFTWARE_MODEL_MAP

export const resolveSoftwareModel = (type?: string) => {
  if (!type) {
    return null
  }

  return SOFTWARE_MODEL_MAP[type as SoftwareCategory] ?? null
}
