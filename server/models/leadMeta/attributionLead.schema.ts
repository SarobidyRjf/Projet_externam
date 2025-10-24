import mongoose from 'mongoose';
import { LEAD_STATUS_VALUES } from '~/constants/lead-statuses';
import { PaymentPlan } from './paymentPlan.schema';

const attributionLeadSchema = new mongoose.Schema({
  id_lead: { type: mongoose.Schema.Types.ObjectId, ref: 'LeadMeta' },
  created_time: Date,
  full_name: String,
  email: String,
  phone_number: String,
  attribution: { type: Boolean, default: false },
  status: {
    type: String,
    default: 'Nouveau lead',
    enum: LEAD_STATUS_VALUES
  },
  statuses: {
    type: [
      {
        name: { type: String, enum: LEAD_STATUS_VALUES, required: true },
        date: { type: Date, required: true }
      }
    ],
    default: () => ([
      {
        name: 'Nouveau lead',
        date: new Date()
      }
    ])
  },
  assigned_to_user: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  },
  nom: String,
  prenom: String,
  phone: String,
  objectif_client: String,
  nom_societe: String,
  localisation_societe: String,
  citycode: String,
  type: String,
  street: String,
  district: String,
  city: String,
  postcode: String,
  label: String,
  panier: String,
  chiffre_affaire: String,
  ca_valeur_min: Number,
  ca_valeur_max: Number,
  unite: String,
  fonction: String,
  domaine: String,
  date_creation: Date || null,
  lieu_vente: String,
  resultat_net: String,
  produit_vendu: String,
  taille_entreprise: String,
  tarif_prestation: String,
  lieu_rdv: String,
  date_rdv: Date || null,
  canaux_marketing: String,
  lien_fb: String,
  lien_insta: String,
  lien_tiktok: String,
  lien_linkedin: String,
  lien_siteweb: String,
  commentaire: String,
  note_R1: String,
  date_rdv_R1: Date || null,
  note_R2: String,
  date_rdv_R2: Date || null,
  note_R3: String,
  note_RDV_strategique: String,
  date_rdv_RDVstat: Date || null,
  note_paiements: String,
  date_rdv_paiement: Date || null,
  type_lieu_rdv: { type: String, enum: ['presentiel', 'visio', 'appel', 'deplacement', 'sur_place'] },
}, {
  timestamps: true
});

export const AttributionLead = mongoose.models.AttributionLead || mongoose.model('AttributionLead', attributionLeadSchema)

attributionLeadSchema.virtual('detailrdv', {
  ref: 'DetailedRdv',       // modèle cible
  localField: '_id',        // champ dans AttributionLead
  foreignField: 'id_lead',  // champ dans DetailedRdv
  justOne: true             // si tu veux récupérer 1 seul detail (sinon enlève)
});

attributionLeadSchema.virtual('paymentPlan', {
  ref: PaymentPlan.modelName,
  localField: '_id',
  foreignField: 'id_lead',
  justOne: true,
});

// Active les virtuals dans JSON/objet
attributionLeadSchema.set('toObject', { virtuals: true });
attributionLeadSchema.set('toJSON', { virtuals: true });

