import mongoose from "mongoose"

export const TesteSchema = new mongoose.Schema({
    nom: {
      type: 'string',
      required: true,
    },
})
  
export const Teste = mongoose.models.Teste || mongoose.model('Teste', TesteSchema)