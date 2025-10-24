// Type pour chaque champ de field_data
interface FieldData {
  name: string;
  values: string[];
}

// Type pour un lead brut reçu de l'API Meta
interface RawLead {
  id: string;
  created_time: string;
  field_data: FieldData[];
}

// Type pour le lead transformé (structure MongoDB)
interface TransformedLead {
  id: string;
  created_time: Date;
  full_name?: string;
  email?: string;
  phone_number?: string;
  chiffre_affaire?: string;
  attribution?: boolean; // Attribution du lead, par défaut false
  ca_valeur_min?: number;
  ca_valeur_max?: number;
  unite?: string;
}

function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  // Numéro FR (06 ou 07)
  if (/^0[67]\d{8}$/.test(digits)) {
    return '+33' + digits.slice(1);
  }

  // Numéro MG (034, 033, 032, 038)
  if (/^0(34|33|32|38)\d{7}$/.test(digits)) {
    return '+261' + digits.slice(1);
  }

  // Déjà en format international FR
  if (/^33[67]\d{8}$/.test(digits)) {
    return '+'.concat(digits);
  }

  // Déjà en format international MG
  if (/^261(34|33|32|38)\d{7}$/.test(digits)) {
    return '+'.concat(digits);
  }

  return digits;
}

export function transformLead(raw: RawLead): TransformedLead {
  const data: Partial<TransformedLead> = {};

  raw.field_data.forEach(item => {
    if (item.name.includes("chiffre")) {
      // const chiffreAffaire = item.values[0].replace(/ /g, '').replace(/-+/g, '_').replace(/\+/g, '');
      const chiffreAffaire = item.values[0]

      data.chiffre_affaire = chiffreAffaire;

      if (chiffreAffaire === "0€_-2000€") {
        data.ca_valeur_min = 0;
        data.ca_valeur_max = 2000;
        data.unite = "euro";
      } else if (chiffreAffaire === "2000€__-_10_000€") {
        data.ca_valeur_min = 2000;
        data.ca_valeur_max = 10000;
        data.unite = "euro";
      } else if (chiffreAffaire === "20_000€_-_50_000€") {
        data.ca_valeur_min = 20000;
        data.ca_valeur_max = 50000;
        data.unite = "euro";
      } else if (chiffreAffaire==="50_000€_-_100_000€") {
        data.ca_valeur_min = 50000;
        data.ca_valeur_max = 100000;
        data.unite = "euro";
      } else if (chiffreAffaire === "+_100_000€") {
        data.ca_valeur_min = 100000;
        data.ca_valeur_max = 1000000;
        data.unite = "euro";
      }
      else if (chiffreAffaire === "moins_de_400_millions_d'ar_par_an") {
        data.ca_valeur_min = 0;
        data.ca_valeur_max = 400000000;
        data.unite = "ariary";
      } else if (chiffreAffaire === "entre_400_et_600_millions_d'ar_par_an") {
        data.ca_valeur_min = 400000000;
        data.ca_valeur_max = 600000000;
        data.unite = "ariary";
      } else if (chiffreAffaire === "entre_600_millions_et_1_milliard_d'ar_par_an") {
        data.ca_valeur_min = 600000000;
        data.ca_valeur_max = 1000000000;
        data.unite = "ariary";
      } else if (chiffreAffaire === "plus_de_1_milliard_d'ar_par_an") {
        data.ca_valeur_min = 1000000000;
        data.ca_valeur_max = 2000000000;
        data.unite = "ariary";
      } else if (chiffreAffaire === "100_000€") {
        data.ca_valeur_min = 100000;
        data.ca_valeur_max = 100000;
        data.unite = "euro";
      }
    } else if (item.name === 'full_name') {
      data.full_name = item.values[0];
    } else if (item.name === 'email') {
      data.email = item.values[0];
    } else if (item.name === 'phone_number') {
      data.phone_number = formatPhoneNumber(item.values[0]);
    }
  });

  return {
    id: raw.id,
    created_time: new Date(raw.created_time),
    ...data,
  };
}
