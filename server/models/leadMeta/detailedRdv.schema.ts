import mongoose from 'mongoose';

const checklistItemSchema = new mongoose.Schema({
    label: {type: String, required: false},
    done: { default: false, type: Boolean, required: false}
})

const checklistSchema = new mongoose.Schema({
    title: { type: String, required: false },
    items: [checklistItemSchema]
})

const detailedRdvSchema = new mongoose.Schema({
    id_lead: { type: mongoose.Schema.Types.ObjectId, ref: 'AttributionLead' },
    date_rdv_rappel: Date,
    reminders: { type: [Number], default: [] },
    // @deprecated - kept for backward compatibility with older payloads
    reminder: { type: Number, default: 0 },
    date_rappel_effective: Date,
    reminder_sent: { type: Boolean, default: false },
    membres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    checklist: [checklistSchema],
    etiquette: [String],
    niveau_prospect: { type: Number },
    piece_jointe: {
        docs_societe: {
            CIN: { type: String },
            CIF: { type: String },
            NIF: { type: String },
            Stat: { type: String },
            RCS: { type: String },
            RIB: { type: String },
        },
        contrat: [String],
        facture: [String],
        autre: [String]
    }
    
}, {
    timestamps: true
});

export const DetailedRdv = mongoose.models.DetailedRdv || mongoose.model('DetailedRdv', detailedRdvSchema)
