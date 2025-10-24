import { required, helpers } from '@vuelidate/validators'

// ✅ Vérifie que *au moins un* des liens réseaux sociaux est rempli
const atLeastOneSocialLink = helpers.withMessage(
  'Un lien est requis',
  (value: any, vm: any) => {
    const { lien_fb, lien_insta, lien_tiktok, lien_linkedin, lien_siteweb } = vm
    return !!(lien_fb || lien_insta || lien_tiktok || lien_linkedin || lien_siteweb)
  }
)

export const rules = {
  nom: { required },
  prenom: { required },
  phone: { required },
  email: { required },
  objectif_client: { required },
  nom_societe: { required },
  localisation_societe: { required },
  panier: { required },
  chiffre_affaire: { required },
  fonction: { required },
  domaine: { required },
  date_creation: { required },
  produit_vendu: { required },
  lieu_vente: { required },
  resultat_net: { required },
  taille_entreprise: { required },
  tarif_prestation: { required },
  type_lieu_rdv: { required },
  lieu_rdv: { },
  date_rdv: { required },
  canaux_marketing: { required },

  // 🔹 On met la même règle sur chaque lien
  lien_fb: { atLeastOneSocialLink },
  lien_insta: { atLeastOneSocialLink },
  lien_tiktok: { atLeastOneSocialLink },
  lien_linkedin: { atLeastOneSocialLink },
  lien_siteweb: { atLeastOneSocialLink },

  commentaire: { required },
  status: { required },
  note_R1: { required },
  note_R2: { required },
  note_R3: { required },
  note_RDV_strategique: { required },
  note_paiements: { required }
}
